<script lang="ts">
import { installPressFeedback } from '@/utils/pressFeedback'
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { PhCheckCircle } from '@phosphor-icons/vue'
import { useTravelStore } from '@/stores/travel'

import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'App',
  components: { PhCheckCircle },
  data() {
    return {
      style: sharedStyle,
      PhCheckCircle: markRawValue(PhCheckCircle),
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
<template>
  <RouterView />
  <Transition
    :enter-active-class="style.toastEnterActive"
    :leave-active-class="style.toastLeaveActive"
    :enter-from-class="style.toastEnterFrom"
    :leave-to-class="style.toastLeaveTo">
    <div
      v-if="store.toast"
      :class="[style.appToast]">
      <PhCheckCircle :size="18" />
      {{ store.toast }}
    </div>
  </Transition>
</template>
