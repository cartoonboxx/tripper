<script lang="ts">
import style from './TripForm.module.scss'
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { PhCheck, PhImage, PhPlus } from '@phosphor-icons/vue'
import { Modal, Input, Button, Select } from '@/components/ui'
import { covers } from '@/data/trips.data'
import { useTravelStore } from '@/stores/travel'
import { componentProps } from './TripForm.props'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'TripForm',
  components: { PhImage, Modal, Input, Button, Select },
  props: componentProps,
  emits: ['close'],
  data() {
    return {
      sharedStyle,
      style,
      error: '',
      form: {
        name: '',
        country: '',
        start: '',
        end: '',
        image: covers[0] || '',
        status: 'upcoming',
        notes: '',
      },
      PhCheck: markRawValue(PhCheck),
      PhImage: markRawValue(PhImage),
      PhPlus: markRawValue(PhPlus),
      covers: markRawValue(covers),
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    router() {
      return this.$router
    },
    fileInput(): HTMLInputElement | undefined {
      return this.$refs.fileInput as HTMLInputElement | undefined
    },
  },
  methods: {
    chooseCover(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 1024 * 1024
      ) {
        this.error = 'Выберите JPG, PNG или WebP размером до 1 МБ.'
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        this.form.image = String(reader.result)
        this.error = ''
      }
      reader.onerror = () => {
        this.error = 'Не удалось открыть изображение. Попробуйте другой файл.'
      }
      reader.readAsDataURL(file)
    },
    save() {
      if (!this.form.name.trim() || !this.form.start || !this.form.end) {
        this.error = 'Заполните название и даты поездки.'
        return
      }
      if (this.form.end < this.form.start) {
        this.error = 'Дата окончания должна быть не раньше начала.'
        return
      }
      if (
        (new Date(this.form.end).getTime() - new Date(this.form.start).getTime()) / 86400000 >
        365
      ) {
        this.error = 'Продолжительность поездки — не более 366 дней.'
        return
      }
      if (this.trip) {
        if (!this.store.editable(this.trip.id)) return
        const current = this.store.trips.find((trip) => trip.id === this.trip?.id)
        if (current) Object.assign(current, this.form, { name: this.form.name.trim() })
        this.store.notify('Изменения сохранены')
        this.$emit('close')
      } else {
        const id = crypto.randomUUID()
        this.store.trips.push({
          ...this.form,
          id,
          name: this.form.name.trim(),
          status: 'upcoming',
          archived: false,
          role: 'organizer',
        })
        this.store.participants.push({
          id: crypto.randomUUID(),
          tripId: id,
          name: this.store.profile.name,
          email: this.store.profile.email,
          role: 'organizer',
          color: '#e5ece6',
        })
        this.store.notify('Поездка создана')
        this.$emit('close')
        this.router.push(`/trips/${id}/plan`)
      }
    },
  },
  watch: {
    open: {
      handler(open: boolean) {
        if (open) {
          Object.assign(
            this.form,
            {
              name: '',
              country: '',
              start: '',
              end: '',
              image: this.covers[0],
              status: 'upcoming',
              notes: '',
            },
            this.trip || {},
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
    :title="trip ? 'Редактировать поездку' : 'Новое путешествие'"
    @close="$emit('close')">
    <form
      @submit.prevent="save"
      :class="sharedStyle.formStack">
      <Input
        v-model="form.name"
        label="Название поездки"
        placeholder="Например, выходные в Барселоне"
        required />
      <Input
        v-model="form.country"
        label="Страна или регион"
        placeholder="Куда отправляемся?" />
      <div :class="sharedStyle.formRow">
        <Input
          v-model="form.start"
          label="Начало поездки"
          type="date"
          required />
        <Input
          v-model="form.end"
          label="Конец поездки"
          type="date"
          :min="form.start"
          required />
      </div>
      <Select
        v-if="trip"
        v-model="form.status"
        label="Статус поездки"
        :options="[
          { label: 'Предстоящая', value: 'upcoming' },
          { label: 'Активная', value: 'active' },
          { label: 'Завершённая', value: 'completed' },
        ]" />
      <Input
        v-model="form.notes"
        type="textarea"
        label="Заметки о поездке" />
      <div>
        <span :class="sharedStyle.fieldLabel">Обложка</span>
        <img
          v-if="form.image.startsWith('data:')"
          :src="form.image"
          alt="Выбранная обложка"
          :class="[style.coverPreview, sharedStyle.coverPreview]" />
        <div :class="sharedStyle.coverOptions">
          <button
            v-for="cover in covers"
            :key="cover"
            type="button"
            :class="{ [sharedStyle.selected || '']: form.image === cover }"
            @click="form.image = cover">
            <img
              :src="cover"
              alt="" />
          </button>
        </div>
      </div>
      <div :class="style.coverUpload">
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          @change="chooseCover" />
        <Button
          variant="secondary"
          size="sm"
          @click="fileInput?.click()">
          <PhImage :size="16" />
          Выбрать изображение
        </Button>
        <span :class="sharedStyle.formHelp">JPG, PNG, WebP · до 1 МБ</span>
      </div>
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
        <Button type="submit">
          <component
            :is="trip ? PhCheck : PhPlus"
            :size="16" />
          {{ trip ? 'Сохранить' : 'Создать поездку' }}
        </Button>
      </div>
    </form>
  </Modal>
</template>
