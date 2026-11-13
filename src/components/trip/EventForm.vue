<template>
  <Modal
    :open="open"
    :title="event ? 'Редактирование' : 'Добавление'"
    @close="$emit('close')">
    <form
      @submit.prevent="save"
      :class="sharedStyle.formStack">
      <Input
        v-model="form.title"
        label="Название"
        placeholder="Что запланируем?"
        required />
      <div :class="sharedStyle.formRow">
        <Input
          :model-value="form.start"
          @update:model-value="updateStart"
          label="Начало"
          type="time"
          required />
        <Input
          v-model="form.end"
          label="Окончание"
          type="time"
          required />
      </div>
      <p
        v-if="endsNextDay"
        :class="sharedStyle.formHelp">
        Окончание на следующий день.
      </p>
      <Select
        v-model="selectedPlaceId"
        label="Место"
        :options="places" />
      <Input
        v-model="form.description"
        type="textarea"
        label="Описание"
        placeholder="Билеты, заметки, важные детали…" />
      <PhotoUpload
        label="Фото события"
        preview-alt="Фото события"
        :image="selectedPlace?.image || form.image"
        :readonly="!!selectedPlace?.image"
        :loading="imageLoading"
        :error="selectedPlace?.image ? '' : imageError"
        @upload="uploadPhoto"
        @remove="setPhoto('')" />
      <p
        v-if="selectedPlace?.image"
        :class="sharedStyle.formHelp">
        Используется фото места «{{ selectedPlace.name }}».
      </p>
      <p
        v-if="error"
        :class="sharedStyle.errorText">
        {{ error }}
      </p>
      <div :class="sharedStyle.formActions">
        <Button
          variant="secondary"
          @click="$emit('close')">
          Отмена
        </Button>
        <Button
          type="submit"
          :disabled="imageLoading">
          {{ event ? 'Сохранить' : 'Добавить' }}
        </Button>
      </div>
    </form>
  </Modal>
</template>
<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { Modal, Input, Select, Button } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import PhotoUpload from '@/components/PhotoUpload/PhotoUpload.vue'
import { componentProps } from './EventForm.props'

export default defineComponent({
  name: 'EventForm',
  components: { Modal, Input, Select, Button, PhotoUpload },
  props: componentProps,
  emits: ['close'],
  data() {
    return {
      sharedStyle,
      selectedPlaceId: '',
      imageError: '',
      imageLoading: false,
      photoRequest: 0,
      error: '',
      form: {
        title: '',
        day: '',
        start: '10:00',
        end: '11:00',
        place: '',
        description: '',
        image: '',
      },
    }
  },
  computed: {
    endsNextDay(): boolean {
      return this.form.start >= '23:00' && this.form.end === `00:${this.form.start.slice(3)}`
    },
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    trip() {
      return this.store.trips.find((t) => t.id === this.tripId)
    },
    places() {
      const options = [
        { label: 'Без привязки к месту', value: '' },
        ...this.store.places.map((place) => ({
          label: this.store.places.some(
            (other) => other.id !== place.id && other.name === place.name,
          )
            ? `${place.name} · ${place.address || place.category}`
            : place.name,
          value: place.id,
        })),
      ]
      if (this.event?.place && this.selectedPlaceId === 'legacy')
        options.push({ label: this.event.place, value: 'legacy' })
      return options
    },
    selectedPlace() {
      return this.store.places.find((place) => place.id === this.selectedPlaceId)
    },
  },
  beforeUnmount() {
    this.photoRequest += 1
  },
  methods: {
    updateStart(value: string | number) {
      this.form.start = String(value)
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(this.form.start)) return
      const hour = (Number(this.form.start.slice(0, 2)) + 1) % 24
      this.form.end = `${String(hour).padStart(2, '0')}:${this.form.start.slice(3)}`
    },
    setPhoto(image: string) {
      this.photoRequest += 1
      this.imageLoading = false
      this.imageError = ''
      this.form.image = image
    },
    uploadPhoto(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      const request = ++this.photoRequest
      this.imageLoading = false
      this.imageError = ''
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 1024 * 1024
      ) {
        this.imageError = 'Выберите JPG, PNG или WebP размером до 1 МБ.'
        return
      }
      this.imageLoading = true
      const reader = new FileReader()
      const fail = () => {
        if (request !== this.photoRequest) return
        this.imageLoading = false
        this.imageError = 'Не удалось открыть изображение. Попробуйте другой файл.'
      }
      reader.onerror = fail
      reader.onload = () => {
        if (request !== this.photoRequest) return
        const image = new Image()
        image.onerror = fail
        image.onload = () => {
          if (request !== this.photoRequest) return
          this.form.image = String(reader.result)
          this.imageLoading = false
        }
        image.src = String(reader.result)
      }
      reader.readAsDataURL(file)
    },
    save() {
      if (!this.store.editable(this.tripId) || this.imageLoading) return
      if (this.form.end <= this.form.start && !this.endsNextDay) {
        this.error = 'Время окончания должно быть позже начала.'
        return
      }
      if (!this.trip || this.form.day < this.trip.start || this.form.day > this.trip.end) {
        this.error = 'Выберите дату в пределах поездки.'
        return
      }
      const place = this.selectedPlace
      this.form.place =
        place?.name || (this.selectedPlaceId === 'legacy' ? this.event?.place || '' : '')
      const values = { ...this.form, placeId: place?.id }
      if (place) this.store.addPlaceToTrip(place.id, this.tripId)
      if (this.event) {
        const current = this.store.events.find((event) => event.id === this.event?.id)
        if (current) Object.assign(current, values)
      } else this.store.events.push({ ...values, id: crypto.randomUUID(), tripId: this.tripId })
      this.store.notify(this.event ? 'Событие обновлено' : 'Событие добавлено')
      this.$emit('close')
    },
  },
  watch: {
    open: {
      handler(open: boolean) {
        this.photoRequest += 1
        this.imageLoading = false
        this.imageError = ''
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
              image: '',
            },
            this.event || {},
          )
          const matches = this.store.places.filter((place) => place.name === this.event?.place)
          const place = this.event?.placeId
            ? this.store.places.find((place) => place.id === this.event?.placeId)
            : matches.length === 1
              ? matches[0]
              : undefined
          this.selectedPlaceId = place?.id || (this.event?.place ? 'legacy' : '')
          this.error = ''
        }
      },
      immediate: true,
    },
  },
})
</script>
