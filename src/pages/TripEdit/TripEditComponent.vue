<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { defineComponent } from 'vue'
import TripForm from '@/components/trip/TripForm.vue'
import { EmptyState, Button } from '@/components/ui'
import tripContext from '@/mixins/tripContext'

export default defineComponent({
  name: 'TripEditComponent',
  components: { SectionHeader, TripForm, EmptyState, Button },
  mixins: [tripContext],
  data() {
    return { open: true }
  },
  methods: {
    close() {
      this.open = false
      this.router.push(`/trips/${this.trip?.id}/plan`)
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
      <SectionHeader
        header="Редактирование поездки"
        level="h1"
        :paragraph="trip.name">
        <template #actions>
          <Button @click="open = true">Открыть форму</Button>
        </template>
      </SectionHeader>
      <TripForm
        :open="open"
        :trip="trip"
        @close="close" />
    </template>
  </div>
</template>
