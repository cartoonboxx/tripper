<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './EventComponent.module.scss'
import { defineComponent } from 'vue'
import { PhArrowLeft, PhCalendarDots, PhMapPin, PhPencilSimple } from '@phosphor-icons/vue'
import { shortDate } from '@/composables/format'
import { Button, Badge, EmptyState } from '@/components/ui'
import EventForm from '@/components/trip/EventForm.vue'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'EventComponent',
  components: {
    PhArrowLeft,
    PhCalendarDots,
    PhMapPin,
    PhPencilSimple,
    Button,
    Badge,
    EmptyState,
    EventForm,
  },
  mixins: [tripContext],
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      editing: this.$route.name === 'event-edit' || this.$route.name === 'event-create',
      PhArrowLeft: markRawValue(PhArrowLeft),
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhMapPin: markRawValue(PhMapPin),
      PhPencilSimple: markRawValue(PhPencilSimple),
    }
  },
  computed: {
    event() {
      return this.store.events.find(
        (e) => e.id === this.route.params.eventId && e.tripId === this.tripId,
      )
    },
    day() {
      return this.store.trips.find((t) => t.id === this.tripId)?.start || ''
    },
  },
  methods: {
    shortDate,
    close() {
      this.editing = false
      if (!this.event) this.router.push(`/trips/${this.tripId}/plan`)
    },
  },
})
</script>
<template>
  <section>
    <template v-if="event">
      <AppLink
        :to="`/trips/${tripId}/plan`"
        :class="[style.eventDetail1, style.backLink]">
        <PhArrowLeft :size="16" />
        К плану поездки
      </AppLink>
      <div :class="[style.panel, style.eventPage]">
        <img
          :src="event.image"
          :alt="event.title"
          :class="[style.detailCover]" />
        <div :class="[style.sectionHeading]">
          <div>
            <Badge>{{ event.category }}</Badge>
            <h2 :class="[style.eventDetail2]">{{ event.title }}</h2>
          </div>
          <Button
            v-if="canEdit"
            variant="secondary"
            @click="editing = true">
            <PhPencilSimple :size="16" />
            Редактировать
          </Button>
        </div>
        <div :class="[style.detailMeta]">
          <p>
            <PhCalendarDots :size="17" />
            {{ shortDate(event.day) }} · {{ event.start }} —
            {{ event.end }}
          </p>
          <p>
            <PhMapPin :size="17" />
            {{ event.place || 'Место не указано' }}
          </p>
        </div>
        <h3>Описание</h3>
        <p :class="[style.subtle]">{{ event.description || 'Заметок пока нет.' }}</p>
      </div>
    </template>
    <EmptyState
      v-else-if="route.name !== 'event-create'"
      title="Событие не найдено"
      description="Возможно, оно уже удалено из плана."
      :icon="PhCalendarDots">
      <Button :to="`/trips/${tripId}/plan`">К плану</Button>
    </EmptyState>
    <EventForm
      v-if="canEdit"
      :open="editing"
      :event="event"
      :trip-id="tripId"
      :day="event?.day || day"
      @close="close" />
  </section>
</template>
