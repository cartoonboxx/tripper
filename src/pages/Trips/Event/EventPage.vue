<template>
  <section>
    <template v-if="event">
      <AppLink
        :to="`/trips/${tripId}/plan`"
        :class="[style.eventDetail1, sharedStyle.backLink]">
        <PhArrowLeft :size="16" />
        К плану поездки
      </AppLink>
      <div :class="[sharedStyle.panel, style.eventPage]">
        <img
          :src="event.image"
          :alt="event.title"
          :class="[sharedStyle.detailCover, style.detailCover]" />
        <Badge>{{ event.category }}</Badge>
        <SectionHeader
          :header="event.title"
          level="h2">
          <template #actions>
            <Button
              v-if="canEdit"
              variant="secondary"
              @click="editing = true">
              <PhPencilSimple :size="16" />
              Редактировать
            </Button>
          </template>
        </SectionHeader>
        <div :class="sharedStyle.detailMeta">
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
        <p :class="sharedStyle.subtle">{{ event.description || 'Заметок пока нет.' }}</p>
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
<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './EventPage.module.scss'
import { defineComponent, markRaw } from 'vue'
import { PhArrowLeft, PhCalendarDots, PhMapPin, PhPencilSimple } from '@phosphor-icons/vue'
import { shortDate } from '@/composables/format'
import { Button, Badge, EmptyState } from '@/components/ui'
import EventForm from '@/components/trip/EventForm.vue'
import tripContext from '@/mixins/tripContext'

export default defineComponent({
  name: 'EventPage',
  components: {
    SectionHeader,
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
      sharedStyle,
      style,
      editing: this.$route.name === 'event-edit' || this.$route.name === 'event-create',
      PhCalendarDots: markRaw(PhCalendarDots),
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
