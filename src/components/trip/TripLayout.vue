<template>
  <div
    v-if="trip"
    :class="style.tripLayout">
    <div :class="style.tripBackRow">
      <AppLink
        to="/trips"
        :class="sharedStyle.backLink">
        <PhArrowLeft :size="16" />
        Все поездки
      </AppLink>
      <span
        v-if="!canEdit"
        :class="style.readonly">
        <PhLockKey :size="16" />
        Только просмотр
      </span>
      <Button
        v-if="canEdit"
        variant="ghost"
        size="sm"
        @click="openEdit">
        <PhPencilSimple :size="16" />
        Редактировать поездку
      </Button>
    </div>
    <section
      :style="{ backgroundImage: trip.image ? `url(${trip.image})` : undefined }"
      :class="style.tripHero">
      <div :class="style.tripHeroContent">
        <span :class="style.heroEyebrow">
          {{ trip.country }}
          <span>•</span>
          ВАШЕ ПУТЕШЕСТВИЕ
        </span>
        <h1>{{ trip.name }}</h1>
        <div :class="style.heroMeta">
          <span>
            <PhCalendarDots :size="16" />
            {{ dateRange(trip.start, trip.end) }}
          </span>
          <span>
            <PhUsers :size="16" />
            {{ store.members(trip.id).length || 1 }} участника
          </span>
        </div>
      </div>
      <Badge :variant="trip.archived ? 'neutral' : 'green'">
        {{
          trip.archived
            ? 'В архиве'
            : trip.status === 'active'
              ? 'В путешествии'
              : 'Предстоящая поездка'
        }}
      </Badge>
      <div :class="style.heroMembers">
        <Avatar
          v-for="member in store.members(trip.id)"
          :key="member.id"
          :name="member.name"
          :color="member.color"
          size="sm" />
      </div>
    </section>
    <nav :class="style.tripTabs">
      <AppLink
        v-for="tab in tripNavigation"
        :key="tab.path"
        :to="`/trips/${trip.id}/${tab.path}`"
        :active-class="style.isActive">
        {{ tab.label }}
      </AppLink>
    </nav>
    <div :class="style.tripContent"><RouterView :key="trip.id" /></div>
    <TripForm
      v-if="canEdit"
      :open="editing"
      :trip="trip"
      @close="editing = false" />
  </div>
  <EmptyState
    v-else
    :icon="PhCompass"
    title="Поездка не найдена"
    description="Возможно, поездка была удалена или ссылка устарела.">
    <Button to="/trips">К моим поездкам</Button>
  </EmptyState>
</template>
<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripLayout.module.scss'
import { defineComponent } from 'vue'
import {
  PhArrowLeft,
  PhCalendarDots,
  PhCompass,
  PhLockKey,
  PhPencilSimple,
  PhUsers,
} from '@phosphor-icons/vue'
import { Button, Avatar, Badge, EmptyState } from '@/components/ui'
import { dateRange } from '@/composables/format'
import { tripNavigation } from '@/data/navigation.data'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'
import TripForm from './TripForm.vue'

export default defineComponent({
  name: 'TripLayout',
  components: {
    PhArrowLeft,
    PhCalendarDots,
    PhLockKey,
    PhPencilSimple,
    PhUsers,
    Button,
    Avatar,
    Badge,
    EmptyState,
    TripForm,
  },
  mixins: [tripContext],
  data() {
    return {
      editing: false,
      sharedStyle,
      style,
      PhArrowLeft: markRawValue(PhArrowLeft),
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhCompass: markRawValue(PhCompass),
      PhLockKey: markRawValue(PhLockKey),
      PhPencilSimple: markRawValue(PhPencilSimple),
      PhUsers: markRawValue(PhUsers),
      tripNavigation: markRawValue(tripNavigation),
    }
  },
  watch: {
    '$route.fullPath'() {
      this.editing = false
    },
  },
  methods: {
    dateRange,
    openEdit(event: MouseEvent) {
      if (!this.canEdit) return
      const button = event.currentTarget as HTMLButtonElement
      button.focus({ preventScroll: true })
      this.editing = true
    },
  },
})
</script>
