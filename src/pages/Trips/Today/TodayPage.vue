<template>
  <TripSchedule today />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import TripSchedule from '@/components/trip/TripSchedule/TripSchedule.vue'

export default defineComponent({
  name: 'TodayPage',
  components: { TripSchedule },
})
</script>
