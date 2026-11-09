import { defineComponent } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { Trip } from '@/types/trip.types'
import { useTravelStore } from '@/stores/travel'

export default defineComponent({
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    route(): RouteLocationNormalizedLoaded {
      return this.$route
    },
    router(): Router {
      return this.$router
    },
    tripId(): string {
      return String(this.$route.params.tripId || '')
    },
    trip(): Trip | undefined {
      return this.store.trips.find((trip) => trip.id === this.tripId)
    },
    canEdit(): boolean {
      return this.trip?.role === 'organizer'
    },
  },
})
