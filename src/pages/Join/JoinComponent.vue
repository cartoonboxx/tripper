<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './JoinComponent.module.scss'
import { defineComponent } from 'vue'
import { PhLink, PhUsers } from '@phosphor-icons/vue'
import { useTravelStore } from '@/stores/travel'
import { Card, Button, Badge, EmptyState } from '@/components/ui'
import { dateRange } from '@/composables/format'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'JoinComponent',
  components: { PhUsers, Card, Button, Badge, EmptyState },
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      PhLink: markRawValue(PhLink),
      PhUsers: markRawValue(PhUsers),
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    router() {
      return this.$router
    },
    route() {
      return this.$route
    },
    trip() {
      return this.store.trips.find((t) => t.id === this.route.params.tripId)
    },
  },
  methods: {
    dateRange,
    join() {
      if (!this.trip) return
      this.trip.role = 'viewer'
      this.router.push(`/trips/${this.trip.id}/overview`)
      this.store.notify('Поездка открыта в режиме просмотра')
    },
  },
})
</script>
<template>
  <div :class="[style.joinPage]">
    <Card
      v-if="trip"
      :class="[style.joinCard]">
      <img
        :src="trip.image"
        :alt="trip.name" />
      <div>
        <span :class="[style.eyebrow]">ВАС ПРИГЛАШАЮТ В ПУТЕШЕСТВИЕ</span>
        <h1>{{ trip.name }}</h1>
        <p :class="[style.subtle]">{{ dateRange(trip.start, trip.end) }}</p>
        <Badge>Только просмотр</Badge>
        <p>
          Посмотрите маршрут, сохранённые места и планы. Общую программу редактирует организатор, а
          личные чек-листы вы можете вести самостоятельно.
        </p>
        <Button @click="join">
          <PhUsers :size="16" />
          Открыть поездку
        </Button>
        <AppLink
          to="/"
          :class="[style.textLink]">
          Вернуться на главную
        </AppLink>
      </div>
    </Card>
    <EmptyState
      v-else
      title="Приглашение недоступно"
      description="Поездка не найдена на этом устройстве. Для обмена данными между устройствами необходимо подключить сервер."
      :icon="PhLink">
      <Button to="/">На главную</Button>
    </EmptyState>
  </div>
</template>
