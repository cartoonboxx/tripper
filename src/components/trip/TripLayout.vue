<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
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
  },
  mixins: [tripContext],
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      PhArrowLeft: markRawValue(PhArrowLeft),
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhCompass: markRawValue(PhCompass),
      PhLockKey: markRawValue(PhLockKey),
      PhPencilSimple: markRawValue(PhPencilSimple),
      PhUsers: markRawValue(PhUsers),
      tripNavigation: markRawValue(tripNavigation),
    }
  },
  methods: { dateRange },
})
</script>
<template>
  <div
    v-if="trip"
    :class="[style.tripLayout]">
    <div :class="[style.tripBackRow]">
      <AppLink
        to="/trips"
        :class="[style.backLink]">
        <PhArrowLeft :size="16" />
        Все поездки
      </AppLink>
      <span
        v-if="!canEdit"
        :class="[style.readonly]">
        <PhLockKey :size="16" />
        Только просмотр
      </span>
      <AppLink
        v-if="canEdit"
        :to="`/trips/${trip.id}/edit`">
        <Button
          variant="ghost"
          size="sm">
          <PhPencilSimple :size="16" />
          Редактировать поездку
        </Button>
      </AppLink>
    </div>
    <section
      :style="{ backgroundImage: `url(${trip.image})` }"
      :class="[style.tripHero]">
      <div :class="[style.tripHeroContent]">
        <span :class="[style.heroEyebrow]">
          {{ trip.country }}
          <span>•</span>
          ВАШЕ ПУТЕШЕСТВИЕ
        </span>
        <h1>{{ trip.name }}</h1>
        <div :class="[style.heroMeta]">
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
      <Badge :variant="trip.status === 'completed' ? 'neutral' : 'green'">
        {{ trip.status === 'completed' ? 'Завершена' : 'Предстоящая поездка' }}
      </Badge>
      <div :class="[style.heroMembers]">
        <Avatar
          v-for="member in store.members(trip.id)"
          :key="member.id"
          :name="member.name"
          :color="member.color"
          size="sm" />
      </div>
    </section>
    <nav
      title="Разделы поездки"
      :class="[style.tripTabs]">
      <AppLink
        v-for="tab in tripNavigation"
        :key="tab.path"
        :to="`/trips/${trip.id}/${tab.path}`"
        :active-class="style.isActive">
        {{ tab.label }}
      </AppLink>
    </nav>
    <div :class="[style.tripContent]"><RouterView :key="trip.id" /></div>
  </div>
  <EmptyState
    v-else
    :icon="PhCompass"
    title="Поездка не найдена"
    description="Возможно, поездка была удалена или ссылка устарела.">
    <Button to="/trips">К моим поездкам</Button>
  </EmptyState>
</template>
