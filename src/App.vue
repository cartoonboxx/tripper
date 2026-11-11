<template>
  <RouterView />
  <AppToast :message="store.toast" />
</template>
<script lang="ts">
import { installPressFeedback } from '@/utils/pressFeedback'
import { defineComponent } from 'vue'
import AppToast from '@/components/AppToast/AppToast.vue'
import { useTravelStore } from '@/stores/travel'

export default defineComponent({
  name: 'App',
  components: { AppToast },
  data() {
    return {
      removePressFeedback: null as (() => void) | null,
    }
  },
  mounted() {
    this.removePressFeedback = installPressFeedback()
  },
  beforeUnmount() {
    this.removePressFeedback?.()
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
  },
  provide() {
    return { size: 20, weight: 'regular' }
  },
})
</script>
