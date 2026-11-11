<template>
  <Card
    interactive
    :class="style.tripCard">
    <AppLink
      :to="`/trips/${trip.id}/today`"
      :class="style.tripCardImage">
      <img
        :src="trip.image"
        :alt="trip.name" />
      <Badge :variant="trip.archived ? 'neutral' : 'green'">
        {{
          trip.archived ? 'В архиве' : trip.status === 'active' ? 'В путешествии' : 'Предстоящая'
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
        <FloatingPopup
          v-if="store.editable(trip.id)"
          v-model:open="menuOpen"
          placement="bottom-end"
          :class="style.cardMenu">
          <template #target>
            <Button
              variant="ghost"
              icon-only>
              <PhDotsThree :size="19" />
            </Button>
          </template>
          <template #default>
            <button
              type="button"
              @click="editTrip">
              Редактировать
            </button>
            <button
              type="button"
              @click="toggleArchive">
              {{ trip.archived ? 'Восстановить' : 'В архив' }}
            </button>
          </template>
        </FloatingPopup>
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
    <TripForm
      :open="editing"
      :trip="trip"
      @close="editing = false" />
  </Card>
</template>
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
import { Card, Badge, Avatar, Button, FloatingPopup } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import { dateRange } from '@/composables/format'
import { componentProps } from './TripCard.props'
import { markRawValue } from '@/utils/markRawValue'
import TripForm from './TripForm.vue'

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
    FloatingPopup,
    TripForm,
  },
  props: componentProps,
  data() {
    return {
      sharedStyle,
      style,
      menuOpen: false,
      editing: false,
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
  methods: {
    dateRange,
    editTrip() {
      if (!this.store.editable(this.trip.id)) return
      this.menuOpen = false
      this.editing = true
    },
    toggleArchive() {
      if (!this.store.editable(this.trip.id)) return
      this.trip.archived = !this.trip.archived
      this.menuOpen = false
      this.store.notify(this.trip.archived ? 'Поездка в архиве' : 'Поездка восстановлена')
    },
  },
})
</script>
