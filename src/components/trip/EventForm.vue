<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { Modal, Input, Select, Button } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import { covers } from '@/data/trips.data'
import { componentProps } from './EventForm.props'

export default defineComponent({
  name: 'EventForm',
  components: { Modal, Input, Select, Button },
  props: componentProps,
  emits: ['close'],
  data() {
    return {
      style: sharedStyle,
      error: '',
      form: {
        title: '',
        day: '',
        start: '10:00',
        end: '11:00',
        place: '',
        description: '',
        image: covers[0] || '',
        category: 'Прогулка',
      },
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    trip() {
      return this.store.trips.find((t) => t.id === this.tripId)
    },
    places() {
      return [
        { label: 'Без привязки к месту', value: '' },
        ...this.store.placesForTrip(this.tripId).map((p) => ({ label: p.name, value: p.name })),
      ]
    },
  },
  methods: {
    save() {
      if (!this.store.editable(this.tripId)) return
      if (this.form.end <= this.form.start) {
        this.error = 'Время окончания должно быть позже начала.'
        return
      }
      if (!this.trip || this.form.day < this.trip.start || this.form.day > this.trip.end) {
        this.error = 'Выберите дату в пределах поездки.'
        return
      }
      const place = this.store
        .placesForTrip(this.tripId)
        .find((place) => place.name === this.form.place)
      if (place) this.form.image = place.image
      if (this.event) {
        const current = this.store.events.find((event) => event.id === this.event?.id)
        if (current) Object.assign(current, this.form)
      } else this.store.events.push({ ...this.form, id: crypto.randomUUID(), tripId: this.tripId })
      this.store.notify(this.event ? 'Событие обновлено' : 'Событие добавлено')
      this.$emit('close')
    },
  },
  watch: {
    open: {
      handler(open: boolean) {
        if (open) {
          Object.assign(
            this.form,
            {
              title: '',
              day: this.day,
              start: '10:00',
              end: '11:00',
              place: '',
              description: '',
              image: covers[0],
              category: 'Прогулка',
            },
            this.event || {},
          )
          this.error = ''
        }
      },
      immediate: true,
    },
  },
})
</script>
<template>
  <Modal
    :open="open"
    :title="event ? 'Редактировать событие' : 'Добавить событие'"
    @close="$emit('close')">
    <form
      @submit.prevent="save"
      :class="style.formStack">
      <Input
        v-model="form.title"
        label="Название"
        placeholder="Что запланируем?"
        required />
      <Input
        v-model="form.day"
        label="Дата"
        type="date"
        :min="trip?.start"
        :max="trip?.end"
        required />
      <div :class="style.formRow">
        <Input
          v-model="form.start"
          label="Начало"
          type="time"
          required />
        <Input
          v-model="form.end"
          label="Окончание"
          type="time"
          required />
      </div>
      <Select
        v-model="form.place"
        label="Сохранённое место"
        :options="places" />
      <Input
        v-model="form.description"
        type="textarea"
        label="Описание"
        placeholder="Билеты, заметки, важные детали…" />
      <p
        v-if="error"
        :class="style.errorText">
        {{ error }}
      </p>
      <div :class="style.formActions">
        <Button
          variant="secondary"
          @click="$emit('close')">
          Отмена
        </Button>
        <Button type="submit">{{ event ? 'Сохранить' : 'Добавить событие' }}</Button>
      </div>
    </form>
  </Modal>
</template>
