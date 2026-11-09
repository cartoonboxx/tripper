<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './PlacesComponent.module.scss'
import { defineComponent } from 'vue'
import {
  PhBookmarkSimple,
  PhCheck,
  PhMagnifyingGlass,
  PhMapPin,
  PhPencilSimple,
  PhPlus,
} from '@phosphor-icons/vue'
import { Button, Tab, Card, Badge, Modal, Input, Select, EmptyState, Drawer } from '@/components/ui'
import { covers } from '@/data/trips.data'
import type { Place } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'PlacesComponent',
  components: {
    PhBookmarkSimple,
    PhMagnifyingGlass,
    PhMapPin,
    PhPencilSimple,
    PhPlus,
    Button,
    Tab,
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
      style: mergeStyles(sharedStyle, style),
      filter: 'all',
      search: '',
      creating: false,
      detail: undefined as Place | undefined,
      editing: undefined as Place | undefined,
      deleting: undefined as Place | undefined,
      form: {
        name: '',
        category: 'Достопримечательность',
        address: '',
        description: '',
        tripId: '',
        image: covers[0] || '',
      },
      PhBookmarkSimple: markRawValue(PhBookmarkSimple),
      PhCheck: markRawValue(PhCheck),
      PhMagnifyingGlass: markRawValue(PhMagnifyingGlass),
      PhMapPin: markRawValue(PhMapPin),
      PhPencilSimple: markRawValue(PhPencilSimple),
      PhPlus: markRawValue(PhPlus),
      covers: markRawValue(covers),
    }
  },
  computed: {
    places() {
      return this.store.places.filter(
        (p) =>
          (!this.tripId || p.tripId === this.tripId) &&
          (this.filter === 'all' || (this.filter === 'planned' ? p.planned : !p.planned)) &&
          p.name.toLowerCase().includes(this.search.toLowerCase()),
      )
    },
    editableTrips() {
      return this.store.trips
        .filter((t) => t.role === 'organizer' && !t.archived)
        .map((t) => ({ label: t.name, value: t.id }))
    },
  },
  methods: {
    open(place?: Place) {
      this.editing = place
      Object.assign(
        this.form,
        {
          name: '',
          category: 'Достопримечательность',
          address: '',
          description: '',
          tripId: this.tripId || this.editableTrips[0]?.value || '',
          image: this.covers[0],
        },
        place || {},
      )
      this.creating = true
      this.detail = undefined
    },
    save() {
      if (!this.store.editable(this.form.tripId)) return
      if (this.editing) Object.assign(this.editing, this.form)
      else this.store.places.push({ ...this.form, id: crypto.randomUUID(), planned: false })
      this.creating = false
      this.store.notify('Место сохранено')
    },
    togglePlanned() {
      const place = this.detail
      if (!place || !this.store.editable(place.tripId)) return
      place.planned = !place.planned
      this.store.notify(
        place.planned ? 'Место отмечено как запланированное' : 'Место возвращено в идеи',
      )
    },
    remove() {
      if (!this.deleting || !this.store.editable(this.deleting.tripId)) return
      this.store.places = this.store.places.filter((p) => p.id !== this.deleting?.id)
      this.deleting = undefined
      this.detail = undefined
      this.store.notify('Место удалено')
    },
  },
})
</script>
<template>
  <div>
    <header :class="tripId ? [style.sectionHeading] : style.pageHeading">
      <div>
        <span :class="[style.eyebrow]">МАЛЕНЬКИЕ ТОЧКИ БОЛЬШОГО МАРШРУТА</span>
        <component :is="tripId ? 'h2' : 'h1'">
          {{ tripId ? 'Места, которые стоит увидеть' : 'Сохранённые места' }}
        </component>
        <p v-if="!tripId">Сохраняйте находки, чтобы однажды оказаться там.</p>
      </div>
      <Button
        v-if="tripId ? canEdit : editableTrips.length"
        :size="tripId ? 'sm' : 'md'"
        @click="open()">
        <PhPlus :size="16" />
        Добавить место
      </Button>
    </header>
    <div :class="[style.toolbar]">
      <div :class="[style.filterTabs]">
        <Tab
          :active="filter === 'all'"
          @click="filter = 'all'">
          Все места
        </Tab>
        <Tab
          :active="filter === 'ideas'"
          @click="filter = 'ideas'">
          Идеи
          <span :class="[style.tabSmallCount]">
            {{ store.places.filter((p) => (!tripId || p.tripId === tripId) && !p.planned).length }}
          </span>
        </Tab>
        <Tab
          :active="filter === 'planned'"
          @click="filter = 'planned'">
          В плане
        </Tab>
      </div>
      <Input
        v-model="search"
        placeholder="Найти место…"
        title="Поиск мест"
        :class="[style.searchField]">
        <template #prefix>
          <PhMagnifyingGlass :size="16" />
        </template>
      </Input>
    </div>
    <div
      v-if="places.length"
      :class="[style.tripGrid, style.placesGrid]">
      <Card
        v-for="place in places"
        :key="place.id"
        interactive
        :class="[style.placeCard]">
        <button
          @click="detail = place"
          :class="[style.placeImage]">
          <img
            :src="place.image"
            :alt="place.name" />
          <span :class="[style.bookmarkMark]">
            <PhBookmarkSimple :size="17" />
          </span>
          <Badge v-if="place.planned">В плане</Badge>
        </button>
        <div :class="[style.placeCardBody]">
          <button
            @click="detail = place"
            :class="[style.placeTitle]">
            {{ place.name }}
          </button>
          <p>{{ place.category }}</p>
          <div :class="[style.placeAddress]">
            <PhMapPin :size="16" />
            {{ place.address || 'Адрес не указан' }}
          </div>
          <div :class="[style.placeCardFooter]">
            <span>{{ store.trips.find((t) => t.id === place.tripId)?.name }}</span>
            <Button
              v-if="store.editable(place.tripId)"
              variant="ghost"
              icon-only
              :title="`Редактировать ${place.name}`"
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
      title="Сохраним что-нибудь интересное?"
      description="Любимые кафе, необычные музеи и красивые виды — всё будет здесь.">
      <Button
        v-if="editableTrips.length"
        @click="open()">
        Добавить место
      </Button>
    </EmptyState>
    <Modal
      :open="creating"
      :title="editing ? 'Редактировать место' : 'Новое место'"
      @close="creating = false">
      <form
        @submit.prevent="save"
        :class="[style.formStack]">
        <Input
          v-model="form.name"
          label="Название"
          placeholder="Например, сады Боболи"
          required />
        <Select
          v-if="!tripId"
          v-model="form.tripId"
          label="Поездка"
          :options="editableTrips"
          required />
        <Select
          v-model="form.category"
          label="Категория"
          :options="
            [
              'Достопримечательность',
              'Парк',
              'Музей',
              'Кафе',
              'Ресторан',
              'Рынок',
              'Смотровая площадка',
            ].map((value) => ({ label: value, value }))
          " />
        <Input
          v-model="form.address"
          label="Адрес"
          placeholder="Улица, дом или ориентир" />
        <div>
          <label
            for="place-description"
            :class="[style.fieldLabel]">
            Заметки
          </label>
          <textarea
            id="place-description"
            v-model="form.description"
            :class="[style.textarea]" />
        </div>
        <div>
          <span :class="[style.fieldLabel]">Фото</span>
          <div :class="[style.coverOptions]">
            <button
              v-for="(cover, i) in covers"
              :key="cover"
              type="button"
              :class="{ [style.selected || '']: form.image === cover }"
              :title="`Фото ${i + 1}`"
              @click="form.image = cover">
              <img
                :src="cover"
                alt="" />
            </button>
          </div>
        </div>
        <div :class="[style.formActions]">
          <Button
            variant="secondary"
            @click="creating = false">
            Отмена
          </Button>
          <Button
            type="submit"
            :disabled="!form.tripId">
            Сохранить место
          </Button>
        </div>
      </form>
    </Modal>
    <Drawer
      :open="!!detail"
      :title="detail?.name || 'Место'"
      @close="detail = undefined">
      <template v-if="detail">
        <img
          :src="detail.image"
          :alt="detail.name"
          :class="[style.detailCover]" />
        <Badge>{{ detail.category }}</Badge>
        <div :class="[style.detailMeta]">
          <p>
            <PhMapPin :size="17" />
            {{ detail.address || 'Адрес не указан' }}
          </p>
        </div>
        <p :class="[style.subtle]">{{ detail.description || 'Добавьте заметку об этом месте.' }}</p>
        <template v-if="store.editable(detail.tripId)">
          <Button
            variant="secondary"
            @click="togglePlanned">
            <component
              :is="detail.planned ? PhCheck : PhPlus"
              :size="16" />
            {{ detail.planned ? 'В плане — вернуть в идеи' : 'Отметить как запланированное' }}
          </Button>
          <div :class="[style.formActions]">
            <Button
              variant="secondary"
              @click="open(detail)">
              Редактировать
            </Button>
            <Button
              variant="danger"
              @click="deleting = detail">
              Удалить
            </Button>
          </div>
        </template>
      </template>
    </Drawer>
    <Modal
      :open="!!deleting"
      title="Удалить место?"
      @close="deleting = undefined">
      <p :class="[style.subtle]">«{{ deleting?.name }}» исчезнет из сохранённых мест.</p>
      <div :class="[style.formActions]">
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
