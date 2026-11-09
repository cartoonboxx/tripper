<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripScheduleComponent.module.scss'
import { defineComponent } from 'vue'
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
import type { PlanEvent } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'TripScheduleComponent',
  components: {
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
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      selectedDay: '',
      creating: false,
      editing: undefined as PlanEvent | undefined,
      detail: undefined as PlanEvent | undefined,
      deleting: undefined as PlanEvent | undefined,
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhClock: markRawValue(PhClock),
      PhCoffee: markRawValue(PhCoffee),
      PhMapPin: markRawValue(PhMapPin),
      PhPencilSimple: markRawValue(PhPencilSimple),
      PhPlus: markRawValue(PhPlus),
      PhSun: markRawValue(PhSun),
      PhTrash: markRawValue(PhTrash),
    }
  },
  computed: {
    days() {
      return this.trip ? this.tripDays(this.trip.start, this.trip.end) : []
    },
    isToday() {
      return this.route.name === 'trip-today'
    },
    events() {
      return this.store.events
        .filter((e) => e.tripId === this.tripId && e.day === this.selectedDay)
        .sort((a, b) => a.start.localeCompare(b.start))
    },
  },
  methods: {
    tripDays,
    shortDate,
    localToday,
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
    isToday: {
      handler(today: boolean) {
        this.selectedDay = today
          ? this.localToday()
          : this.days.includes(this.selectedDay)
            ? this.selectedDay
            : this.days[1] || this.days[0] || ''
      },
      immediate: true,
    },
  },
})
</script>
<template>
  <div :class="[style.scheduleLayout, { [style.scheduleLayoutToday || '']: isToday }]">
    <aside
      v-if="!isToday"
      :class="[style.dayList]">
      <span :class="[style.eyebrow]">ДНИ ПОЕЗДКИ</span>
      <Tab
        v-for="(day, i) in days"
        :key="day"
        variant="vertical"
        :active="selectedDay === day"
        @click="selectedDay = day">
        <span>
          <strong>День {{ i + 1 }}</strong>
          <small>
            {{
              new Date(day + 'T12:00:00').toLocaleDateString('ru-RU', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
            }}
          </small>
        </span>
        <span :class="[style.dayEventCount]">
          {{ store.events.filter((e) => e.tripId === tripId && e.day === day).length || '—' }}
        </span>
      </Tab>
      <div :class="[style.daysNote]">
        <PhSun :size="17" />
        <span>
          Оставьте место
          <br />
          для спонтанности
        </span>
      </div>
    </aside>
    <section :class="[style.scheduleMain]">
      <div :class="[style.sectionHeading]">
        <div>
          <span :class="[style.eyebrow]">
            {{ isToday ? 'ВАШ ДЕНЬ В ПУТЕШЕСТВИИ' : 'МАРШРУТ И ВПЕЧАТЛЕНИЯ' }}
          </span>
          <h2>
            {{ isToday ? 'Сегодня' : `День ${days.indexOf(selectedDay) + 1}` }}
            <span :class="[style.scheduleHeadingDate]">
              {{
                new Date(selectedDay + 'T12:00:00').toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              }}
            </span>
          </h2>
        </div>
        <Button
          v-if="canEdit && days.includes(selectedDay)"
          size="sm"
          @click="
            () => {
              editing = undefined
              creating = true
            }
          ">
          <PhPlus :size="16" />
          Добавить событие
        </Button>
      </div>
      <div
        v-if="events.length"
        :class="[style.eventList]">
        <article
          v-for="event in events"
          :key="event.id"
          :class="[style.eventCard]">
          <div :class="[style.eventTime]">
            <strong>{{ event.start }}</strong>
            <span>{{ event.end }}</span>
            <span :class="[style.timeDot]" />
          </div>
          <button
            @click="detail = event"
            :class="[style.eventDetailsButton]">
            <img
              :src="event.image"
              :alt="event.title" />
            <div>
              <Badge variant="neutral">{{ event.category }}</Badge>
              <h3>{{ event.title }}</h3>
              <p>
                <PhMapPin :size="16" />
                {{ event.place || 'Место не указано' }}
              </p>
            </div>
          </button>
          <div
            v-if="canEdit"
            :class="[style.eventActions]">
            <Button
              variant="ghost"
              icon-only
              :title="`Редактировать ${event.title}`"
              @click="edit(event)">
              <PhPencilSimple :size="16" />
            </Button>
            <Button
              variant="ghost"
              icon-only
              :title="`Удалить ${event.title}`"
              @click="deleting = event">
              <PhTrash :size="16" />
            </Button>
          </div>
        </article>
        <div :class="[style.scheduleEnd]">
          <span />
          {{ events.length }} события · {{ shortDate(selectedDay) }}
          <span />
        </div>
      </div>
      <EmptyState
        v-else
        :icon="PhSun"
        :title="
          isToday && !days.includes(selectedDay)
            ? 'Сегодня можно помечтать о поездке'
            : 'Этот день — чистый лист'
        "
        :description="
          isToday && !days.includes(selectedDay)
            ? 'Сегодняшняя дата за пределами поездки. Все события доступны в плане.'
            : 'Добавьте интересное место, прогулку или время на отдых.'
        ">
        <Button
          v-if="canEdit && days.includes(selectedDay)"
          variant="secondary"
          @click="
            () => {
              editing = undefined
              creating = true
            }
          ">
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
        :class="[style.scheduleTip]">
        <PhCoffee :size="17" />
        <span>Лучшие моменты часто случаются между пунктами плана.</span>
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
          :src="detail.image"
          :alt="detail.title"
          :class="[style.detailCover]" />
        <Badge>{{ detail.category }}</Badge>
        <div :class="[style.detailMeta]">
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
        <p :class="[style.subtle]">
          {{ detail.description || 'Дополнительных заметок пока нет.' }}
        </p>
        <div
          v-if="canEdit"
          :class="[style.formActions]">
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
        </div>
      </template>
    </Drawer>
    <Modal
      :open="!!deleting"
      title="Удалить событие?"
      @close="deleting = undefined">
      <p :class="[style.subtle]">«{{ deleting?.title }}» будет удалено из плана поездки.</p>
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
