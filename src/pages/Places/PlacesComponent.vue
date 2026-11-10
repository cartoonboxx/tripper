<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import {
  PhBookmarkSimple,
  PhMagnifyingGlass,
  PhMapPin,
  PhPencilSimple,
  PhPlus,
} from '@phosphor-icons/vue'
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { Button, Card, Badge, Modal, Input, Select, EmptyState, Drawer } from '@/components/ui'
import { covers } from '@/data/trips.data'
import type { Place } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'
import sharedStyle from '@/styles/shared.module.scss'
import style from './PlacesComponent.module.scss'
import { placeCategories } from './PlacesComponent.data'

export default defineComponent({
  name: 'PlacesComponent',
  components: {
    SectionHeader,
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
      covers,
      placeCategories,
      PhBookmarkSimple: markRaw(PhBookmarkSimple),
      search: '',
      librarySearch: '',
      selectedTrip: '',
      creating: false,
      choosing: false,
      detail: undefined as Place | undefined,
      editing: undefined as Place | undefined,
      deleting: undefined as Place | undefined,
      form: {
        name: '',
        category: 'Достопримечательность',
        address: '',
        description: '',
        image: covers[0] || '',
      },
    }
  },
  computed: {
    canManagePlaces() {
      return !this.tripId || this.canEdit
    },
    tripPlaces() {
      return this.tripId ? this.store.placesForTrip(this.tripId) : this.store.places
    },
    places() {
      const search = this.search.toLowerCase()
      return this.tripPlaces.filter((place) => place.name.toLowerCase().includes(search))
    },
    availablePlaces() {
      const assigned = new Set(this.tripPlaces.map((place) => place.id))
      const search = this.librarySearch.toLowerCase()
      return this.store.places.filter(
        (place) => !assigned.has(place.id) && place.name.toLowerCase().includes(search),
      )
    },
    attachedTrips() {
      return this.detail ? this.store.tripsForPlace(this.detail.id) : []
    },
    tripOptions() {
      const attached = new Set(this.attachedTrips.map((trip) => trip.id))
      const trips = this.store.trips.filter(
        (trip) => trip.role === 'organizer' && !trip.archived && !attached.has(trip.id),
      )
      return [
        { label: 'Выберите поездку', value: '' },
        ...trips.map((trip) => ({ label: trip.name, value: trip.id })),
      ]
    },
  },
  methods: {
    startAdd() {
      if (!this.canManagePlaces) return
      if (this.tripId) {
        this.librarySearch = ''
        this.choosing = true
      } else this.open()
    },
    open(place?: Place) {
      if (!this.canManagePlaces) return
      this.editing = place
      this.form = {
        name: place?.name || '',
        category: place?.category || 'Достопримечательность',
        address: place?.address || '',
        description: place?.description || '',
        image: place?.image || this.covers[0] || '',
      }
      this.choosing = false
      this.detail = undefined
      this.creating = true
    },
    save() {
      if (!this.canManagePlaces || !this.form.name.trim()) return
      const fields = { ...this.form, name: this.form.name.trim() }
      if (this.editing) Object.assign(this.editing, fields)
      else {
        const place = { ...fields, id: crypto.randomUUID() }
        this.store.places.push(place)
        if (this.tripId) this.store.addPlaceToTrip(place.id, this.tripId)
      }
      this.creating = false
      this.store.notify('Место сохранено')
    },
    showDetail(place: Place) {
      this.detail = place
      this.selectedTrip = ''
    },
    addExisting(place: Place) {
      if (this.store.addPlaceToTrip(place.id, this.tripId)) {
        this.choosing = false
        this.store.notify('Место добавлено в поездку')
      }
    },
    assignToTrip() {
      if (!this.detail) return
      if (this.store.addPlaceToTrip(this.detail.id, this.selectedTrip)) {
        this.selectedTrip = ''
        this.store.notify('Место добавлено в поездку')
      }
    },
    detachFromTrip(tripId: string) {
      if (!this.detail || !this.store.editable(tripId)) return
      this.store.removePlaceFromTrip(this.detail.id, tripId)
      this.store.notify('Место убрано из поездки и осталось в сохранённых')
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
<template>
  <div>
    <SectionHeader
      :header="tripId ? 'Места, которые стоит увидеть' : 'Сохранённые места'"
      :level="tripId ? 'h2' : 'h1'"
      :paragraph="
        tripId
          ? 'Добавляйте места из сохранённых или создавайте новые.'
          : 'Сохраняйте находки и добавляйте их в любые поездки.'
      ">
      <template #actions>
        <Button
          v-if="canManagePlaces"
          :size="tripId ? 'sm' : 'md'"
          @click="startAdd">
          <PhPlus :size="16" />
          Добавить место
        </Button>
      </template>
    </SectionHeader>
    <Input
      v-model="search"
      placeholder="Найти место…"
      :class="style.searchField">
      <template #prefix><PhMagnifyingGlass :size="16" /></template>
    </Input>
    <div
      v-if="places.length"
      :class="sharedStyle.tripGrid">
      <Card
        v-for="place in places"
        :key="place.id"
        interactive>
        <button
          @click="showDetail(place)"
          :class="style.placeImage">
          <img
            :src="place.image"
            :alt="place.name" />
          <span :class="style.bookmarkMark"><PhBookmarkSimple :size="17" /></span>
        </button>
        <div :class="style.placeCardBody">
          <button
            @click="showDetail(place)"
            :class="style.placeTitle">
            {{ place.name }}
          </button>
          <p>{{ place.category }}</p>
          <div :class="style.placeAddress">
            <PhMapPin :size="16" />
            {{ place.address || 'Адрес не указан' }}
          </div>
          <div :class="style.placeCardFooter">
            <span>В поездках: {{ store.tripsForPlace(place.id).length }}</span>
            <Button
              v-if="canManagePlaces"
              variant="ghost"
              icon-only
              @click="open(place)">
              <PhPencilSimple :size="16" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
    <EmptyState
      v-else
      :icon="PhBookmarkSimple"
      :title="search ? 'Места не найдены' : 'Сохраним что-нибудь интересное?'"
      description="Любимые кафе, необычные музеи и красивые виды — всё будет здесь.">
      <Button
        v-if="canManagePlaces"
        @click="startAdd">
        Добавить место
      </Button>
    </EmptyState>
    <Modal
      :open="choosing"
      title="Добавить место в поездку"
      @close="choosing = false">
      <div :class="sharedStyle.formStack">
        <Input
          v-model="librarySearch"
          label="Поиск сохранённых мест"
          placeholder="Название места" />
        <div :class="style.savedPlaces">
          <Button
            v-for="place in availablePlaces"
            :key="place.id"
            variant="secondary"
            @click="addExisting(place)">
            <PhPlus :size="16" />
            {{ place.name }}
          </Button>
          <p
            v-if="!availablePlaces.length"
            :class="sharedStyle.subtle">
            Подходящих сохранённых мест пока нет.
          </p>
        </div>
        <Button @click="open()">Создать новое место</Button>
      </div>
    </Modal>
    <Modal
      :open="creating"
      :title="editing ? 'Редактировать место' : 'Новое место'"
      @close="creating = false">
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
          placeholder="Улица, дом или ориентир" />
        <Input
          v-model="form.description"
          type="textarea"
          label="Заметки"
          placeholder="Что стоит знать об этом месте?" />
        <div>
          <span :class="sharedStyle.fieldLabel">Фото</span>
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
        <p :class="sharedStyle.formHelp">
          Место хранится в сохранённых и может использоваться в нескольких поездках.
        </p>
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="creating = false">
            Отмена
          </Button>
          <Button type="submit">Сохранить место</Button>
        </div>
      </form>
    </Modal>
    <Drawer
      :open="!!detail"
      :title="detail?.name || 'Место'"
      @close="detail = undefined">
      <div
        v-if="detail"
        :class="style.placeDetails">
        <img
          :src="detail.image"
          :alt="detail.name"
          :class="sharedStyle.detailCover" />
        <Badge>{{ detail.category }}</Badge>
        <p :class="style.placeAddress">
          <PhMapPin :size="17" />
          {{ detail.address || 'Адрес не указан' }}
        </p>
        <p :class="style.description">
          {{ detail.description || 'Добавьте заметку об этом месте.' }}
        </p>
        <h3>В поездках</h3>
        <div
          v-for="trip in attachedTrips"
          :key="trip.id"
          :class="style.assignedTrip">
          <AppLink :to="`/trips/${trip.id}/places`">{{ trip.name }}</AppLink>
          <Button
            v-if="store.editable(trip.id) && canManagePlaces"
            variant="ghost"
            size="sm"
            @click="detachFromTrip(trip.id)">
            Убрать из поездки
          </Button>
        </div>
        <p
          v-if="!attachedTrips.length"
          :class="sharedStyle.subtle">
          Место пока не добавлено в поездки.
        </p>
        <form
          v-if="canManagePlaces && tripOptions.length > 1"
          @submit.prevent="assignToTrip"
          :class="sharedStyle.formStack">
          <Select
            v-model="selectedTrip"
            label="Добавить в поездку"
            :options="tripOptions"
            required />
          <Button
            type="submit"
            variant="secondary"
            :disabled="!selectedTrip">
            Добавить в поездку
          </Button>
        </form>
        <div
          v-if="canManagePlaces"
          :class="sharedStyle.formActions">
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
        </div>
      </div>
    </Drawer>
    <Modal
      :open="!!deleting"
      title="Удалить место?"
      @close="deleting = undefined">
      <p :class="sharedStyle.subtle">
        «{{ deleting?.name }}» будет удалено из сохранённых и из всех поездок, куда оно добавлено.
      </p>
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
