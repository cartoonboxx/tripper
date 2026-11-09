<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripOverviewComponent.module.scss'
import { defineComponent } from 'vue'
import {
  PhArrowRight,
  PhCalendarDots,
  PhCaretRight,
  PhListChecks,
  PhMapPin,
  PhSuitcaseRolling,
} from '@phosphor-icons/vue'
import { tripDays, shortDate } from '@/composables/format'
import { Button, Card, EmptyState, Checkbox } from '@/components/ui'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'TripOverviewComponent',
  components: {
    PhArrowRight,
    PhCalendarDots,
    PhCaretRight,
    PhListChecks,
    PhMapPin,
    PhSuitcaseRolling,
    Button,
    Card,
    EmptyState,
    Checkbox,
  },
  mixins: [tripContext],
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      PhArrowRight: markRawValue(PhArrowRight),
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhCaretRight: markRawValue(PhCaretRight),
      PhListChecks: markRawValue(PhListChecks),
      PhMapPin: markRawValue(PhMapPin),
      PhSuitcaseRolling: markRawValue(PhSuitcaseRolling),
    }
  },
  computed: {
    events() {
      return this.store.events
        .filter((e) => e.tripId === this.tripId)
        .sort((a, b) => (a.day + a.start).localeCompare(b.day + b.start))
    },
    checklist() {
      return this.store.checklists.find((c) => c.tripId === this.tripId)
    },
  },
  methods: { tripDays, shortDate },
})
</script>
<template>
  <div v-if="trip">
    <div :class="[style.sectionHeading]">
      <div>
        <span :class="[style.eyebrow]">ПУТЕШЕСТВИЕ СТАНОВИТСЯ БЛИЖЕ</span>
        <h2>Всё самое важное</h2>
      </div>
      <AppLink :to="`/trips/${tripId}/plan`">
        <Button
          variant="secondary"
          size="sm">
          Открыть план
          <PhArrowRight :size="16" />
        </Button>
      </AppLink>
    </div>
    <div :class="[style.statsGrid]">
      <Card :class="[style.statCard]">
        <span :class="[style.statLabel]">
          <PhCalendarDots :size="16" />
          Дней путешествия
        </span>
        <strong :class="[style.statNumber]">{{ tripDays(trip.start, trip.end).length }}</strong>
        <span :class="[style.statCaption]">Время для новых открытий</span>
      </Card>
      <Card :class="[style.statCard]">
        <span :class="[style.statLabel]">
          <PhMapPin :size="16" />
          Сохранено мест
        </span>
        <strong :class="[style.statNumber]">
          {{ store.places.filter((p) => p.tripId === tripId).length }}
        </strong>
        <span :class="[style.statCaption]">Маленькие точки большого маршрута</span>
      </Card>
      <Card :class="[style.statCard]">
        <span :class="[style.statLabel]">
          <PhListChecks :size="16" />
          Событий в плане
        </span>
        <strong :class="[style.statNumber]">{{ events.length }}</strong>
        <span :class="[style.statCaption]">Каждый день — новая история</span>
      </Card>
    </div>
    <div :class="[style.twoColumn]">
      <section :class="[style.panel]">
        <div :class="[style.sectionHeading]">
          <h3>В планах</h3>
          <PhCalendarDots
            :size="18"
            :class="[style.subtle]" />
        </div>
        <AppLink
          v-for="event in events.slice(0, 3)"
          :key="event.id"
          :to="`/trips/${tripId}/events/${event.id}`"
          :class="[style.overviewEvent]">
          <img
            :src="event.image"
            alt="" />
          <div>
            <span :class="[style.smallLabel]">{{ shortDate(event.day) }} · {{ event.start }}</span>
            <h4>{{ event.title }}</h4>
            <span :class="[style.subtle]">{{ event.place }}</span>
          </div>
          <PhCaretRight :size="16" />
        </AppLink>
        <EmptyState
          v-if="!events.length"
          title="Пока никаких планов"
          description="Самое время добавить первое событие."
          :icon="PhCalendarDots" />
      </section>
      <section :class="[style.panel]">
        <div :class="[style.sectionHeading]">
          <h3>Готовимся к поездке</h3>
          <PhSuitcaseRolling
            :size="18"
            :class="[style.subtle]" />
        </div>
        <p :class="[style.subtle]">Проверьте самое необходимое перед дорогой.</p>
        <div
          v-for="item in checklist?.items.slice(0, 4)"
          :key="item.id"
          :class="[style.overviewCheck]">
          <Checkbox
            v-model="item.checked"
            :label="item.title" />
        </div>
        <AppLink
          :to="`/trips/${tripId}/checklists`"
          :class="[style.tripoverviewDetail1, style.textLink]">
          Все чек-листы
          <PhArrowRight :size="16" />
        </AppLink>
      </section>
    </div>
  </div>
</template>
