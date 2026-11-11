<template>
  <TripSchedule />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import TripSchedule from '@/components/trip/TripSchedule/TripSchedule.vue'

export default defineComponent({
  name: 'PlanPage',
  components: { TripSchedule },
})
</script>
