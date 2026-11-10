<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripCard.module.scss'
import { defineComponent } from 'vue'
import {
  PhArrowRight,
  PhArrowUpRight,
  PhCalendarDots,
  PhDotsThree,
  PhUser,
} from '@phosphor-icons/vue'
import { Card, Badge, Avatar, Button } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import { dateRange } from '@/composables/format'
import { componentProps } from './TripCard.props'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'TripCard',
  components: {
    PhArrowRight,
    PhArrowUpRight,
    PhCalendarDots,
    PhDotsThree,
    PhUser,
    Card,
    Badge,
    Avatar,
    Button,
  },
  props: componentProps,
  data() {
    return {
      sharedStyle,
      style,
      menuOpen: false,
      PhArrowRight: markRawValue(PhArrowRight),
      PhArrowUpRight: markRawValue(PhArrowUpRight),
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhDotsThree: markRawValue(PhDotsThree),
      PhUser: markRawValue(PhUser),
    }
  },
  computed: {
    members() {
      return this.store.members(this.trip.id)
    },
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
  },
  methods: { dateRange },
})
</script>
<template>
  <Card
    interactive
    :class="style.tripCard">
    <AppLink
      :to="`/trips/${trip.id}/plan`"
      :class="style.tripCardImage">
      <img
        :src="trip.image"
        :alt="trip.name" />
      <Badge :variant="trip.status === 'completed' ? 'neutral' : 'green'">
        {{
          trip.status === 'completed'
            ? 'Завершена'
            : trip.status === 'active'
              ? 'В путешествии'
              : 'Предстоящая'
        }}
      </Badge>
      <span :class="style.tripCardImageArrow">
        <PhArrowUpRight :size="19" />
      </span>
    </AppLink>
    <div :class="style.tripCardBody">
      <div :class="style.tripCardTitle">
        <div>
          <span :class="[sharedStyle.eyebrow, style.eyebrow]">{{ trip.country }}</span>
          <AppLink :to="`/trips/${trip.id}/plan`">
            <h3>{{ trip.name }}</h3>
          </AppLink>
        </div>
        <div
          v-if="store.editable(trip.id)"
          :class="style.cardMenu">
          <Button
            variant="ghost"
            icon-only
            @click="menuOpen = !menuOpen">
            <PhDotsThree :size="19" />
          </Button>
          <div
            v-if="menuOpen"
            :class="style.dropdownMenu">
            <AppLink :to="`/trips/${trip.id}/edit`">Редактировать</AppLink>
            <button
              @click="
                () => {
                  trip.archived = !trip.archived
                  menuOpen = false
                  store.notify(trip.archived ? 'Поездка в архиве' : 'Поездка восстановлена')
                }
              ">
              {{ trip.archived ? 'Восстановить' : 'В архив' }}
            </button>
          </div>
        </div>
      </div>
      <p :class="style.tripCardDates">
        <PhCalendarDots :size="16" />
        {{ dateRange(trip.start, trip.end) }}
      </p>
      <div :class="style.tripCardBottom">
        <div :class="style.tripMembers">
          <div :class="style.avatarStack">
            <Avatar
              v-for="member in members.slice(0, 3)"
              :key="member.id"
              :name="member.name"
              :color="member.color"
              :class="style.memberAvatar"
              size="sm" />
            <span
              v-if="!members.length"
              :class="style.soloTraveler">
              <PhUser :size="16" />
            </span>
          </div>
          <span :class="style.memberLabel">{{ members.length || 1 }} участника</span>
        </div>
        <AppLink
          :to="`/trips/${trip.id}/plan`"
          :class="style.cardOpenLink">
          Открыть
          <PhArrowRight :size="16" />
        </AppLink>
      </div>
    </div>
  </Card>
</template>
