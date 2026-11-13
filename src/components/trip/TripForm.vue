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
        v-if="trip && !trip.archived"
        v-model="form.status"
        label="Статус поездки"
        :options="[
          { label: 'Предстоящая', value: 'upcoming' },
          { label: 'Активная', value: 'active' },
        ]" />
      <Input
        v-model="form.notes"
        type="textarea"
        label="Заметки о поездке" />
      <PhotoUpload
        label="Обложка"
        preview-alt="Выбранная обложка"
        :image="form.image"
        :loading="imageLoading"
        :error="imageError"
        @upload="chooseCover"
        @remove="removePhoto" />
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
          <component
            :is="trip ? PhCheck : PhPlus"
            :size="16" />
          {{ trip ? 'Сохранить' : 'Создать поездку' }}
        </Button>
      </div>
    </form>
  </Modal>
</template>
<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { PhCheck, PhPlus } from '@phosphor-icons/vue'
import { Modal, Input, Button, Select } from '@/components/ui'
import PhotoUpload from '@/components/PhotoUpload/PhotoUpload.vue'
import { useTravelStore } from '@/stores/travel'
import { componentProps } from './TripForm.props'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'TripForm',
  components: { Modal, Input, Button, Select, PhotoUpload },
  props: componentProps,
  emits: ['close'],
  data() {
    return {
      sharedStyle,
      error: '',
      imageError: '',
      imageLoading: false,
      photoRequest: 0,
      form: {
        name: '',
        country: '',
        start: '',
        end: '',
        image: '',
        status: 'upcoming',
        notes: '',
      },
      PhCheck: markRawValue(PhCheck),
      PhPlus: markRawValue(PhPlus),
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    router() {
      return this.$router
    },
  },
  beforeUnmount() {
    this.photoRequest += 1
  },
  methods: {
    removePhoto() {
      this.photoRequest += 1
      this.imageLoading = false
      this.imageError = ''
      this.form.image = ''
    },
    chooseCover(event: Event) {
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
      if (this.imageLoading) return
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
        this.photoRequest += 1
        this.imageLoading = false
        this.imageError = ''
        if (open) {
          Object.assign(
            this.form,
            {
              name: '',
              country: '',
              start: '',
              end: '',
              image: '',
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
