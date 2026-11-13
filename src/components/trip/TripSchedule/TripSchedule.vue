<template>
  <div :class="[style.scheduleLayout, { [style.scheduleLayoutToday || '']: isToday }]">
    <aside
      v-if="!isToday"
      :class="style.dayList">
      <span :class="[sharedStyle.eyebrow, style.eyebrow]">ДНИ ПОЕЗДКИ</span>
      <Tab
        v-for="day in scheduleDays"
        :key="day.date"
        variant="vertical"
        :active="selectedDay === day.date"
        @click="selectedDay = day.date">
        <span>
          <strong>День {{ day.number }}</strong>
          <small>
            {{ day.label }}
          </small>
        </span>
        <span :class="style.dayEventCount">
          {{ day.eventCount || '—' }}
        </span>
      </Tab>
      <div :class="style.daysNote">
        <PhSun :size="17" />
        <span>
          Оставьте место
          <br />
          для спонтанности
        </span>
      </div>
    </aside>
    <section :class="style.scheduleMain">
      <TodayWeather v-if="isToday" />
      <SectionHeader
        :header="isToday ? 'Сегодня' : `День ${days.indexOf(selectedDay) + 1}`"
        :paragraph="selectedDayLabel"
        :class="style.sectionHeader">
        <template #actions>
          <Button
            v-if="canAddEvent"
            size="sm"
            @click="createEvent">
            <PhPlus :size="16" />
            Добавить событие
          </Button>
        </template>
      </SectionHeader>
      <p
        v-if="canEdit && events.length > 1"
        :class="style.reorderHint">
        Зажмите карточку мышью и перетащите её на нужное место.
      </p>
      <div
        v-if="events.length"
        :class="style.eventList">
        <TransitionGroup
          tag="div"
          :class="style.eventList"
          :move-class="style.eventMove">
          <div
            v-for="event in displayedEvents"
            :key="event.id"
            :ref="(element) => setEventCard(event.id, element)"
            :class="[style.eventSlot, draggedEventId === event.id && style.isPlaceholder]"
            :style="draggedEventId === event.id ? { height: `${dragHeight}px` } : undefined">
            <article
              :class="[
                style.eventCard,
                canEdit && events.length > 1 && style.isMovable,
                draggedEventId === event.id && style.isDragging,
              ]"
              :style="draggedEventId === event.id ? draggedCardStyle : undefined"
              @pointerdown="startPointer($event, event)"
              @click.capture="suppressDragClick"
              @contextmenu="preventReorderMenu"
              @dragstart.prevent>
              <div :class="style.eventTime">
                <strong>{{ event.start }}</strong>
                <span>{{ event.end }}</span>
                <span :class="style.timeDot" />
              </div>
              <button
                @click="detail = event"
                :class="style.eventDetailsButton">
                <img
                  v-if="store.imageForEvent(event)"
                  :src="store.imageForEvent(event)"
                  :alt="event.title" />
                <div>
                  <Badge
                    v-if="store.placeForEvent(event)?.category"
                    variant="neutral">
                    {{ store.placeForEvent(event)?.category }}
                  </Badge>
                  <h3>{{ event.title }}</h3>
                  <p>
                    <PhMapPin :size="16" />
                    {{ event.place || 'Место не указано' }}
                  </p>
                </div>
              </button>
              <div
                v-if="canEdit"
                :class="style.eventActions">
                <Button
                  variant="ghost"
                  icon-only
                  @click="edit(event)">
                  <PhPencilSimple :size="16" />
                </Button>
                <Button
                  variant="ghost"
                  icon-only
                  @click="deleting = event">
                  <PhTrash :size="16" />
                </Button>
              </div>
            </article>
          </div>
        </TransitionGroup>
        <div :class="style.scheduleEnd">
          <span />
          {{ events.length }} события · {{ shortDate(selectedDay) }}
          <span />
        </div>
      </div>
      <EmptyState
        v-else
        :icon="PhSun"
        :title="todayOutsideTrip ? 'Сегодня можно помечтать о поездке' : 'Этот день — чистый лист'"
        :description="
          todayOutsideTrip
            ? 'Сегодняшняя дата за пределами поездки. Все события доступны в плане.'
            : 'Добавьте интересное место, прогулку или время на отдых.'
        ">
        <Button
          v-if="canAddEvent"
          variant="secondary"
          @click="createEvent">
          <PhPlus :size="16" />
          Первое событие
        </Button>
        <AppLink
          v-else
          :to="`/trips/${tripId}/plan`">
          <Button variant="secondary">Перейти к плану</Button>
        </AppLink>
      </EmptyState>
      <div
        v-if="events.length"
        :class="style.scheduleTip">
        <PhCoffee :size="17" />
        <span>Лучшие моменты часто случаются между пунктами плана.</span>
      </div>
      <div
        v-if="isToday"
        :class="style.todaySections">
        <ChecklistsComponent attached-only />
      </div>
    </section>
    <EventForm
      :open="creating"
      :trip-id="tripId"
      :day="selectedDay"
      :event="editing"
      @close="creating = false" />
    <Drawer
      :open="!!detail"
      :title="detail?.title || 'Событие'"
      @close="detail = undefined">
      <template v-if="detail">
        <img
          v-if="store.imageForEvent(detail)"
          :src="store.imageForEvent(detail)"
          :alt="detail.title"
          :class="sharedStyle.detailCover" />
        <Badge v-if="store.placeForEvent(detail)?.category">
          {{ store.placeForEvent(detail)?.category }}
        </Badge>
        <div :class="sharedStyle.detailMeta">
          <p>
            <PhCalendarDots :size="17" />
            {{ shortDate(detail.day) }}
          </p>
          <p>
            <PhClock :size="17" />
            {{ detail.start }} — {{ detail.end }}
          </p>
          <p>
            <PhMapPin :size="17" />
            {{ detail.place || 'Место не указано' }}
          </p>
        </div>
        <h3>Детали и заметки</h3>
        <p :class="sharedStyle.subtle">
          {{ detail.description || 'Дополнительных заметок пока нет.' }}
        </p>
      </template>
      <template
        v-if="detail && canEdit"
        #footer>
        <Button
          variant="secondary"
          @click="edit(detail)">
          <PhPencilSimple :size="16" />
          Редактировать
        </Button>
        <Button
          variant="danger"
          @click="deleting = detail">
          <PhTrash :size="16" />
        </Button>
      </template>
    </Drawer>
    <Modal
      :open="!!deleting"
      title="Удалить событие?"
      @close="deleting = undefined">
      <p :class="sharedStyle.subtle">«{{ deleting?.title }}» будет удалено из плана поездки.</p>
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
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripSchedule.module.scss'
import { defineComponent, markRaw, type CSSProperties } from 'vue'
import {
  PhCalendarDots,
  PhClock,
  PhCoffee,
  PhMapPin,
  PhPencilSimple,
  PhPlus,
  PhSun,
  PhTrash,
} from '@phosphor-icons/vue'
import { tripDays, shortDate, localToday } from '@/composables/format'
import { Button, Tab, EmptyState, Badge, Drawer, Modal } from '@/components/ui'
import EventForm from '@/components/trip/EventForm.vue'
import TodayWeather from '@/components/trip/TodayWeather/TodayWeather.vue'
import ChecklistsComponent from '@/pages/Checklists/ChecklistsPage.vue'
import type { PlanEvent } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'

export default defineComponent({
  name: 'TripSchedule',
  components: {
    SectionHeader,
    TodayWeather,
    ChecklistsComponent,
    PhCalendarDots,
    PhClock,
    PhCoffee,
    PhMapPin,
    PhPencilSimple,
    PhPlus,
    PhSun,
    PhTrash,
    Button,
    Tab,
    EmptyState,
    Badge,
    Drawer,
    Modal,
    EventForm,
  },
  mixins: [tripContext],
  props: { today: { type: Boolean, default: false } },
  data() {
    return {
      sharedStyle,
      style,
      selectedDay: '',
      eventCards: markRaw(new Map<string, HTMLElement>()),
      heldEventId: '',
      draggedEventId: '',
      previewIds: [] as string[],
      dragWidth: 0,
      dragHeight: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      pointerId: null as number | null,
      suppressClickUntil: 0,
      dragX: 0,
      dragY: 0,
      pressX: 0,
      pressY: 0,
      pressTimer: null as ReturnType<typeof setTimeout> | null,
      scrollFrame: null as number | null,
      creating: false,
      editing: undefined as PlanEvent | undefined,
      detail: undefined as PlanEvent | undefined,
      deleting: undefined as PlanEvent | undefined,
      PhSun: markRaw(PhSun),
    }
  },
  computed: {
    displayedEvents(): PlanEvent[] {
      if (!this.draggedEventId) return this.events
      const byId = new Map(this.events.map((event) => [event.id, event]))
      return this.previewIds
        .map((id) => byId.get(id))
        .filter((event): event is PlanEvent => !!event)
    },
    draggedCardStyle(): CSSProperties | undefined {
      if (!this.draggedEventId) return undefined
      return {
        width: `${this.dragWidth}px`,
        height: `${this.dragHeight}px`,
        left: `${this.dragX - this.dragOffsetX}px`,
        top: `${this.dragY - this.dragOffsetY}px`,
      }
    },
    scheduleDays() {
      return this.days.map((day, index) => ({
        date: day,
        number: index + 1,
        label: this.formatDay(day, 'short', 'short'),
        eventCount: this.store.events.filter(
          (event) => event.tripId === this.tripId && event.day === day,
        ).length,
      }))
    },
    selectedDayLabel() {
      return this.formatDay(this.selectedDay, 'long', 'long')
    },
    canAddEvent() {
      return this.canEdit && this.days.includes(this.selectedDay)
    },
    todayOutsideTrip() {
      return this.isToday && !this.days.includes(this.selectedDay)
    },
    days() {
      return this.trip ? tripDays(this.trip.start, this.trip.end) : []
    },
    isToday() {
      return this.today
    },
    events() {
      return this.store.events
        .filter((e) => e.tripId === this.tripId && e.day === this.selectedDay)
        .sort((a, b) => a.start.localeCompare(b.start))
    },
  },
  mounted() {
    window.addEventListener('pointermove', this.movePointer)
    window.addEventListener('pointerup', this.finishPointer)
    window.addEventListener('pointercancel', this.cancelPointer)
    window.addEventListener('blur', this.cancelReorder)
    window.addEventListener('keydown', this.cancelByKey)
  },
  beforeUnmount() {
    this.cancelReorder()
    window.removeEventListener('pointermove', this.movePointer)
    window.removeEventListener('pointerup', this.finishPointer)
    window.removeEventListener('pointercancel', this.cancelPointer)
    window.removeEventListener('blur', this.cancelReorder)
    window.removeEventListener('keydown', this.cancelByKey)
  },
  methods: {
    setEventCard(id: string, element: unknown) {
      if (element instanceof HTMLElement) this.eventCards.set(id, element)
      else this.eventCards.delete(id)
    },
    canStartReorder(target: EventTarget | null) {
      return (
        this.canEdit &&
        this.events.length > 1 &&
        target instanceof Element &&
        !target.closest(`.${style.eventActions}`)
      )
    },
    startPointer(pointer: PointerEvent, event: PlanEvent) {
      if (
        pointer.pointerType !== 'mouse' ||
        pointer.button !== 0 ||
        !pointer.isPrimary ||
        !this.canStartReorder(pointer.target)
      )
        return
      this.startReorder(event, pointer.clientX, pointer.clientY)
      this.pointerId = pointer.pointerId
    },
    startReorder(event: PlanEvent, x: number, y: number) {
      this.cancelReorder()
      this.heldEventId = event.id
      this.pressX = this.dragX = x
      this.pressY = this.dragY = y
      this.pressTimer = setTimeout(() => {
        const card = this.eventCards.get(event.id)
        if (!card) return this.cancelReorder()
        const bounds = card.getBoundingClientRect()
        this.dragWidth = bounds.width
        this.dragHeight = bounds.height
        this.dragOffsetX = this.dragX - bounds.left
        this.dragOffsetY = this.dragY - bounds.top
        this.previewIds = this.events.map((item) => item.id)
        this.draggedEventId = event.id
        this.suppressClickUntil = Number.POSITIVE_INFINITY
        window.getSelection()?.removeAllRanges()
        this.animateReorder()
      }, 350)
    },
    movePointer(pointer: PointerEvent) {
      if (pointer.pointerId !== this.pointerId) return
      this.moveReorder(pointer.clientX, pointer.clientY)
    },
    moveReorder(x: number, y: number) {
      if (!this.heldEventId) return
      this.dragX = x
      this.dragY = y
      if (!this.draggedEventId) {
        if (Math.hypot(x - this.pressX, y - this.pressY) > 8) this.cancelReorder()
        return
      }
      this.updateDropTarget()
    },
    updateDropTarget() {
      const remaining = this.previewIds.filter((id) => id !== this.draggedEventId)
      let targetIndex = remaining.length
      for (let index = 0; index < remaining.length; index++) {
        const card = this.eventCards.get(remaining[index]!)
        if (!card) continue
        const bounds = card.getBoundingClientRect()
        if (this.dragY < bounds.top + bounds.height / 2) {
          targetIndex = index
          break
        }
      }
      const currentIndex = this.previewIds.indexOf(this.draggedEventId)
      if (currentIndex === targetIndex) return
      remaining.splice(targetIndex, 0, this.draggedEventId)
      this.previewIds = remaining
    },
    animateReorder() {
      if (!this.draggedEventId) return
      const edge = 80
      const bottom = window.innerHeight - (window.innerWidth <= 900 ? 96 : 0)
      if (this.dragY < edge) window.scrollBy(0, -12)
      else if (this.dragY > bottom - edge) window.scrollBy(0, 12)
      this.updateDropTarget()
      this.scrollFrame = requestAnimationFrame(this.animateReorder)
    },
    finishPointer(pointer: PointerEvent) {
      if (pointer.pointerId === this.pointerId) this.finishReorder()
    },
    cancelPointer(pointer: PointerEvent) {
      if (pointer.pointerId === this.pointerId) this.cancelReorder()
    },
    finishReorder() {
      const index = this.previewIds.indexOf(this.draggedEventId)
      const target = this.events[index]
      if (this.draggedEventId && target && this.store.moveEvent(this.draggedEventId, target.id))
        this.store.notify('Порядок событий сохранён')
      this.cancelReorder()
    },
    cancelReorder() {
      if (this.pressTimer) clearTimeout(this.pressTimer)
      if (this.scrollFrame !== null) cancelAnimationFrame(this.scrollFrame)
      if (this.draggedEventId) this.suppressClickUntil = Date.now() + 400
      this.pressTimer = null
      this.scrollFrame = null
      this.heldEventId = this.draggedEventId = ''
      this.previewIds = []
      this.pointerId = null
    },
    cancelByKey(key: KeyboardEvent) {
      if (key.key === 'Escape') this.cancelReorder()
    },
    suppressDragClick(click: MouseEvent) {
      if (Date.now() < this.suppressClickUntil) {
        click.preventDefault()
        click.stopPropagation()
      }
    },
    preventReorderMenu(menu: MouseEvent) {
      if (this.heldEventId || this.draggedEventId) menu.preventDefault()
    },
    createEvent() {
      this.editing = undefined
      this.creating = true
    },
    formatDay(day: string, weekday: 'short' | 'long', month: 'short' | 'long') {
      return new Date(day + 'T12:00:00').toLocaleDateString('ru-RU', {
        weekday,
        day: 'numeric',
        month,
      })
    },
    shortDate,
    edit(event: PlanEvent) {
      this.editing = event
      this.creating = true
      this.detail = undefined
    },
    remove() {
      if (!this.deleting || !this.canEdit) return
      this.store.events = this.store.events.filter((e) => e.id !== this.deleting?.id)
      this.deleting = undefined
      this.detail = undefined
      this.store.notify('Событие удалено')
    },
  },
  watch: {
    selectedDay() {
      this.cancelReorder()
    },
    tripId() {
      this.cancelReorder()
    },
    canEdit(editable: boolean) {
      if (!editable) this.cancelReorder()
    },
    isToday: {
      handler(today: boolean) {
        this.cancelReorder()
        if (today) {
          this.selectedDay = localToday()
        } else if (!this.days.includes(this.selectedDay)) {
          this.selectedDay = this.days[1] || this.days[0] || ''
        }
      },
      immediate: true,
    },
  },
})
</script>
