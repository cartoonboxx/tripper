<template>
  <div :class="[style.root, (matchWidth || fullWidth) && style.matchWidth]">
    <div
      ref="anchor"
      :class="style.anchor"
      @pointerdown.capture="triggerWasOpen = !!open"
      @pointercancel.capture="triggerWasOpen = null"
      @keydown.capture="triggerWasOpen = null"
      @click="onTargetClick">
      <slot
        v-if="$slots.target"
        name="target"
        :open="open" />
      <slot
        v-else
        name="trigger"
        :open="open"
        :toggle="toggle">
        <Button
          variant="secondary"
          @click="toggle">
          {{ label }}
        </Button>
      </slot>
    </div>
    <div
      ref="panel"
      popover="auto"
      :class="[style.panel, appearance.panel, matchWidth && style.matchWidthPanel]"
      :style="{ left: `${left}px`, top: `${top}px` }"
      @beforetoggle="onBeforeToggle"
      @toggle="onToggle">
      <slot :close="close" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import Button from '../Button/ButtonStyle.vue'
import { componentProps } from './FloatingPopup.props'
import style from './FloatingPopupBase.module.scss'

export default defineComponent({
  name: 'FloatingPopupBase',
  components: { Button },
  props: componentProps,
  emits: ['update:open', 'close'],
  data() {
    return {
      style,
      triggerWasOpen: null as boolean | null,
      left: 0,
      top: 0,
      observer: null as ResizeObserver | null,
      previousFocus: null as HTMLElement | null,
    }
  },
  watch: {
    open() {
      this.syncOpen()
    },
    matchWidth() {
      this.updatePosition()
    },
    placement() {
      this.updatePosition()
    },
  },
  mounted() {
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = markRaw(new ResizeObserver(this.updatePosition))
      this.observer.observe(this.$refs.anchor as HTMLElement)
      this.observer.observe(this.$refs.panel as HTMLElement)
    }
    window.addEventListener('resize', this.updatePosition)
    window.addEventListener('scroll', this.updatePosition, true)
    this.syncOpen()
  },
  beforeUnmount() {
    this.observer?.disconnect()
    window.removeEventListener('resize', this.updatePosition)
    window.removeEventListener('scroll', this.updatePosition, true)
    if (this.open) this.restoreFocus()
  },
  methods: {
    toggle() {
      this.$emit('update:open', !(this.triggerWasOpen ?? this.open))
      this.triggerWasOpen = null
    },
    onTargetClick() {
      if (this.$slots.target) this.toggle()
    },
    close() {
      if (!this.open) return
      this.$emit('update:open', false)
      this.$emit('close')
    },
    restoreFocus() {
      if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true })
      this.previousFocus = null
    },
    syncOpen() {
      const panel = this.$refs.panel as HTMLElement | undefined
      if (!panel) return
      if (this.open && !panel.matches(':popover-open')) {
        const active = document.activeElement as HTMLElement | null
        const anchor = this.$refs.anchor as HTMLElement
        this.previousFocus =
          active && active !== document.body
            ? active
            : anchor.querySelector<HTMLElement>('button, a[href], input, select')
        panel.showPopover()
        this.updatePosition()
        panel
          .querySelector<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')
          ?.focus({ preventScroll: true })
      } else if (!this.open && panel.matches(':popover-open')) {
        panel.hidePopover()
        this.restoreFocus()
      }
    },
    onBeforeToggle(event: Event) {
      if ((event as ToggleEvent).newState === 'closed') this.close()
    },
    onToggle(event: Event) {
      if ((event as ToggleEvent).newState !== 'closed') return
      const panel = this.$refs.panel as HTMLElement
      if (panel.matches(':popover-open')) return
      // Preserve focus when the user clicked another control outside the popup.
      if (document.activeElement === document.body || panel.contains(document.activeElement)) {
        this.restoreFocus()
      } else {
        this.previousFocus = null
      }
    },
    updatePosition() {
      const panel = this.$refs.panel as HTMLElement | undefined
      const anchor = this.$refs.anchor as HTMLElement | undefined
      if (!this.open || !panel || !anchor) return
      const bounds = anchor.getBoundingClientRect()
      panel.style.width = this.matchWidth ? `${bounds.width}px` : ''
      const gap = parseFloat(getComputedStyle(panel).getPropertyValue('--popup-gap')) || 8
      const padding = gap
      const safeBottom = parseFloat(getComputedStyle(panel).paddingBottom) || 0
      const bottomLimit =
        window.innerHeight -
        padding -
        (window.innerWidth <= 600
          ? parseFloat(getComputedStyle(panel).getPropertyValue('--mobile-nav-height')) + safeBottom
          : 0)
      const below = bottomLimit - bounds.bottom - gap
      const above = bounds.top - padding - gap
      const preferTop = this.placement.startsWith('top')
      const useTop = preferTop
        ? above >= panel.offsetHeight || above > below
        : below < panel.offsetHeight && above > below
      const x = this.placement.endsWith('end') ? bounds.right - panel.offsetWidth : bounds.left
      const y = useTop ? bounds.top - panel.offsetHeight - gap : bounds.bottom + gap
      this.left = Math.max(padding, Math.min(x, window.innerWidth - panel.offsetWidth - padding))
      this.top = Math.max(padding, Math.min(y, bottomLimit - panel.offsetHeight))
    },
  },
})
</script>
