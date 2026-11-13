<template>
  <div :class="style.photoSection">
    <label :for="inputId">{{ label }}</label>
    <div :class="style.photoContent">
      <input
        :id="inputId"
        ref="photoInput"
        type="file"
        :disabled="readonly"
        accept="image/jpeg,image/png,image/webp"
        hidden
        @change="$emit('upload', $event)" />
      <img
        v-if="image"
        :src="image"
        :alt="previewAlt"
        :class="style.photoPreview" />
      <button
        v-else
        type="button"
        :class="style.uploadCard"
        @click="choosePhoto">
        <span :class="style.uploadIcon"><PhImage :size="24" /></span>
        <span :class="style.uploadContent">
          <span :class="style.uploadLabel">Загрузить фото</span>
          <span :class="style.uploadHelp">JPG, PNG, WebP · до 1 МБ</span>
        </span>
        <PhUploadSimple
          :size="20"
          :class="style.uploadArrow" />
      </button>
      <div
        v-if="image && !readonly"
        :class="style.photoActions">
        <Button
          v-if="image"
          variant="secondary"
          size="sm"
          @click="choosePhoto">
          <PhUploadSimple :size="16" />
          Заменить фото
        </Button>
        <Button
          v-if="image"
          variant="ghost"
          size="sm"
          @click="$emit('remove')">
          <PhTrash :size="16" />
          Удалить фото
        </Button>
      </div>
      <p
        v-if="loading"
        :class="style.photoHelp">
        Загрузка фото…
      </p>
      <p
        v-if="error"
        :class="style.photoError">
        {{ error }}
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { PhImage, PhTrash, PhUploadSimple } from '@phosphor-icons/vue'
import { Button } from '@/components/ui'
import { createId } from '@/utils/createId'
import style from './PhotoUpload.module.scss'

export default defineComponent({
  name: 'PhotoUpload',
  components: { Button, PhImage, PhTrash, PhUploadSimple },
  props: {
    image: { type: String, default: '' },
    label: { type: String, default: 'Фото' },
    previewAlt: { type: String, default: 'Выбранное фото' },
    loading: { type: Boolean },
    readonly: { type: Boolean },
    error: { type: String, default: '' },
  },
  emits: ['upload', 'remove'],
  data() {
    return { style, inputId: createId('photo') }
  },
  methods: {
    choosePhoto() {
      ;(this.$refs.photoInput as HTMLInputElement | undefined)?.click()
    },
  },
})
</script>
