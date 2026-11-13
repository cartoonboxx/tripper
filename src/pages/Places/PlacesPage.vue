<template>
  <div>
    <SectionHeader
      :header="tripId ? 'Места, которые стоит увидеть' : 'Сохранённые места'"
      :level="tripId ? 'h2' : 'h1'"
      :paragraph="
        tripId
          ? 'Управляйте сохранёнными местами в общем разделе «Места».'
          : 'Сохраняйте интересные места, фото и заметки о них.'
      ">
      <template #actions>
        <Button
          v-if="canManagePlaces"
          :size="tripId ? 'sm' : 'md'"
          @click="open()">
          <PhPlus :size="16" />
          Добавить место
        </Button>
      </template>
    </SectionHeader>
    <div :class="style.filters">
      <Input
        v-model="search"
        label="Поиск мест"
        placeholder="Найти место…">
        <template #prefix><PhMagnifyingGlass :size="16" /></template>
      </Input>
      <Select
        v-model="selectedCategory"
        label="Категория места"
        :options="categoryFilters" />
    </div>
    <div
      v-if="places.length"
      :class="sharedStyle.tripGrid">
      <Card
        v-for="place in places"
        :key="place.id"
        interactive>
        <button
          @click="detail = place"
          :class="style.placeImage">
          <img
            v-if="place.image"
            :src="place.image"
            :alt="place.name" />
          <span :class="style.bookmarkMark"><PhBookmarkSimple :size="17" /></span>
        </button>
        <div :class="style.placeCardBody">
          <button
            @click="detail = place"
            :class="style.placeTitle">
            {{ place.name }}
          </button>
          <p>{{ place.category }}</p>
          <div :class="style.placeAddress">
            <PhMapPin :size="16" />
            {{ place.address || 'Адрес не указан' }}
          </div>
          <div
            v-if="canManagePlaces"
            :class="style.placeCardFooter">
            <Button
              variant="ghost"
              icon-only
              @click="open(place)">
              <PhPencilSimple :size="16" />
            </Button>
            <Button
              variant="ghost"
              icon-only
              @click="deleting = place">
              <PhTrash size="16" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
    <EmptyState
      v-else
      :icon="PhBookmarkSimple"
      :title="hasFilters ? 'Места не найдены' : 'Сохраним что-нибудь интересное?'"
      :description="
        hasFilters
          ? 'Попробуйте другую категорию или измените поисковый запрос.'
          : 'Любимые кафе, необычные музеи и красивые виды — всё будет здесь.'
      ">
      <Button
        v-if="hasFilters"
        variant="secondary"
        @click="resetFilters">
        Сбросить фильтры
      </Button>
      <Button
        v-else-if="canManagePlaces"
        @click="open()">
        Добавить место
      </Button>
    </EmptyState>
    <Modal
      :open="creating"
      :title="editing ? 'Редактировать место' : 'Новое место'"
      @close="closeForm">
      <form
        @submit.prevent="save"
        :class="sharedStyle.formStack">
        <Input
          v-model="form.name"
          label="Название"
          placeholder="Например, сады Боболи"
          required />
        <Select
          v-model="form.category"
          label="Категория"
          :options="placeCategories" />
        <Input
          v-model="form.address"
          label="Адрес"
          placeholder="Улица, дом или ориентир">
          <template #suffix>
            <Button
              variant="ghost"
              size="sm"
              icon-only
              @click="selectingPoint = true">
              <PhMapPin :size="20" />
            </Button>
          </template>
        </Input>
        <Input
          v-model="form.description"
          type="textarea"
          label="Заметки"
          placeholder="Что стоит знать об этом месте?" />
        <PhotoUpload
          label="Фото"
          preview-alt="Выбранное фото места"
          :image="form.image"
          :loading="imageLoading"
          :error="imageError"
          @upload="uploadPhoto"
          @remove="removePhoto()" />
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="closeForm">
            Отмена
          </Button>
          <Button
            type="submit"
            :disabled="imageLoading">
            Сохранить место
          </Button>
        </div>
      </form>
    </Modal>
    <PlaceMapPicker
      v-if="creating && selectingPoint"
      :coordinates="form.coordinates"
      :address="form.address"
      @select="selectPoint"
      @close="selectingPoint = false" />
    <Drawer
      :open="!!detail"
      :title="detail?.name || 'Место'"
      @close="detail = undefined">
      <div
        v-if="detail"
        :class="style.placeDetails">
        <img
          v-if="detail.image"
          :src="detail.image"
          :alt="detail.name"
          :class="sharedStyle.detailCover" />
        <Badge>{{ detail.category }}</Badge>
        <p :class="style.placeAddress">
          <PhMapPin :size="17" />
          {{ detail.address || 'Адрес не указан' }}
        </p>
        <p
          v-if="detail.coordinates"
          :class="style.placeAddress">
          Точка: {{ detail.coordinates.latitude.toFixed(6) }},
          {{ detail.coordinates.longitude.toFixed(6) }}
        </p>
        <p :class="style.description">
          {{ detail.description || 'Добавьте заметку об этом месте.' }}
        </p>
      </div>
      <template
        v-if="detail && canManagePlaces"
        #footer>
        <Button
          variant="secondary"
          @click="open(detail)">
          Редактировать
        </Button>
        <Button
          variant="danger"
          @click="deleting = detail">
          Удалить место
        </Button>
      </template>
    </Drawer>
    <Modal
      :open="!!deleting"
      title="Удалить место?"
      @close="deleting = undefined">
      <p :class="sharedStyle.subtle">«{{ deleting?.name }}» будет удалено из сохранённых мест.</p>
      <div :class="sharedStyle.formActions">
        <Button
          variant="secondary"
          @click="deleting = undefined">
          Отмена
        </Button>
        <Button
          variant="danger"
          @click="remove">
          Удалить
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent, markRaw } from 'vue'
import {
  PhBookmarkSimple,
  PhMagnifyingGlass,
  PhMapPin,
  PhPencilSimple,
  PhPlus,
  PhTrash,
} from '@phosphor-icons/vue'
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { Button, Card, Badge, Modal, Input, Select, EmptyState, Drawer } from '@/components/ui'
import PhotoUpload from '@/components/PhotoUpload/PhotoUpload.vue'
import type { Place, PlaceCoordinates } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'
import sharedStyle from '@/styles/shared.module.scss'
import style from './PlacesPage.module.scss'
import type { PlaceMapSelection } from './PlaceMapPicker/PlaceMapPicker.types'

export default defineComponent({
  name: 'PlacesPage',
  components: {
    PhTrash,
    PlaceMapPicker: defineAsyncComponent(() => import('./PlaceMapPicker/PlaceMapPicker.vue')),
    SectionHeader,
    PhotoUpload,
    PhBookmarkSimple,
    PhMagnifyingGlass,
    PhMapPin,
    PhPencilSimple,
    PhPlus,
    Button,
    Card,
    Badge,
    Modal,
    Input,
    Select,
    EmptyState,
    Drawer,
  },
  mixins: [tripContext],
  data() {
    return {
      style,
      sharedStyle,
      PhBookmarkSimple: markRaw(PhBookmarkSimple),
      search: '',
      selectedCategory: '',
      imageError: '',
      imageLoading: false,
      photoRequest: 0,
      creating: false,
      selectingPoint: false,
      detail: undefined as Place | undefined,
      editing: undefined as Place | undefined,
      deleting: undefined as Place | undefined,
      form: {
        name: '',
        category: 'Достопримечательность',
        address: '',
        coordinates: undefined as PlaceCoordinates | undefined,
        description: '',
        image: '',
      },
    }
  },
  computed: {
    canManagePlaces() {
      return !this.tripId
    },
    placeCategories() {
      const options = this.store.categoryOptions('places')
      const category = this.editing?.category
      if (category && !options.some((option) => option.value === category))
        options.push({ label: category, value: category })
      return options
    },
    tripPlaces() {
      return this.tripId ? this.store.placesForTrip(this.tripId) : this.store.places
    },
    hasFilters() {
      return Boolean(this.search.trim() || this.selectedCategory)
    },
    categoryFilters() {
      const categories = new Set([
        ...this.store.categories.places,
        ...this.tripPlaces.map((place) => place.category),
      ])
      return [
        { label: 'Все категории', value: '' },
        ...Array.from(categories, (value) => ({ label: value, value })),
      ]
    },
    places() {
      const search = this.search.trim().toLocaleLowerCase('ru')
      return this.tripPlaces.filter(
        (place) =>
          (!this.selectedCategory || place.category === this.selectedCategory) &&
          place.name.toLocaleLowerCase('ru').includes(search),
      )
    },
  },
  beforeUnmount() {
    this.photoRequest += 1
  },
  methods: {
    selectPoint(selection: PlaceMapSelection) {
      this.form.coordinates = { latitude: selection.latitude, longitude: selection.longitude }
      if (selection.address !== undefined) this.form.address = selection.address
      this.selectingPoint = false
    },
    resetFilters() {
      this.search = ''
      this.selectedCategory = ''
    },
    open(place?: Place) {
      if (!this.canManagePlaces) return
      this.closeForm()
      this.imageError = ''
      this.editing = place
      this.form = {
        name: place?.name || '',
        category: place?.category || 'Достопримечательность',
        address: place?.address || '',
        coordinates: place?.coordinates ? { ...place.coordinates } : undefined,
        description: place?.description || '',
        image: place?.image || '',
      }
      this.detail = undefined
      this.creating = true
    },
    save() {
      if (!this.canManagePlaces || this.imageLoading || !this.form.name.trim()) return
      const fields = { ...this.form, name: this.form.name.trim() }
      if (this.editing) Object.assign(this.editing, fields)
      else {
        const place = { ...fields, id: crypto.randomUUID() }
        this.store.places.push(place)
      }
      this.closeForm()
      this.store.notify('Место сохранено')
    },
    closeForm() {
      this.photoRequest += 1
      this.imageLoading = false
      this.selectingPoint = false
      this.creating = false
    },
    removePhoto() {
      this.photoRequest += 1
      this.imageLoading = false
      this.imageError = ''
      this.form.image = ''
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
    remove() {
      if (!this.deleting || !this.canManagePlaces) return
      this.store.removePlace(this.deleting.id)
      this.deleting = undefined
      this.detail = undefined
      this.store.notify('Место удалено')
    },
  },
})
</script>
