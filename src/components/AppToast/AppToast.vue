<template>
  <Teleport to="body">
    <Transition
      appear
      :enter-active-class="style.toastEnterActive"
      :leave-active-class="style.toastLeaveActive"
      :enter-from-class="style.toastEnterFrom"
      :leave-to-class="style.toastLeaveTo"
      @enter="showToast">
      <div
        v-if="message"
        ref="toast"
        popover="manual"
        :class="style.appToast">
        <PhCheckCircle :size="18" />
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { PhCheckCircle } from '@phosphor-icons/vue'
import style from './AppToast.module.scss'

export default defineComponent({
  name: 'AppToast',
  components: { PhCheckCircle },
  props: {
    message: { type: String, default: '' },
  },
  data() {
    return {
      style,
      observer: null as MutationObserver | null,
    }
  },
  mounted() {
    this.observer = new MutationObserver((records) => {
      const modalOpened = records.some(
        ({ target }) => target instanceof HTMLDialogElement && target.matches(':modal'),
      )
      if (modalOpened) this.showToast()
    })
    this.observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    })
  },
  beforeUnmount() {
    this.observer?.disconnect()
  },
  methods: {
    showToast() {
      const toast = this.$refs.toast as HTMLElement | undefined
      if (!toast || !this.message) return
      // Reinsert above any dialog opened after the notification.
      if (toast.matches(':popover-open')) toast.hidePopover()
      toast.showPopover()
    },
  },
})
</script>
