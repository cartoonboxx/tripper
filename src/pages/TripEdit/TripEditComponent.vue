<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import TripForm from '@/components/trip/TripForm.vue'
import { EmptyState, Button } from '@/components/ui'
import tripContext from '@/mixins/tripContext'

export default defineComponent({
  name: 'TripEditComponent',
  components: { TripForm, EmptyState, Button },
  mixins: [tripContext],
  data() {
    return { style: sharedStyle, open: true }
  },
  methods: {
    close() {
      this.open = false
      this.router.push(`/trips/${this.trip?.id}/information`)
    },
  },
})
</script>
<template>
  <div>
    <EmptyState
      v-if="!trip || !canEdit"
      title="Редактирование недоступно"
      description="Только организатор может изменять общую информацию о поездке.">
      <Button to="/trips">К поездкам</Button>
    </EmptyState>
    <template v-else>
      <div :class="[style.pageHeading]">
        <div>
          <h1>Редактирование поездки</h1>
          <p>{{ trip.name }}</p>
        </div>
        <Button @click="open = true">Открыть форму</Button>
      </div>
      <TripForm
        :open="open"
        :trip="trip"
        @close="close" />
    </template>
  </div>
</template>
