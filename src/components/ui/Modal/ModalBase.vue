<template>
  <Teleport to="body">
    <Transition
      appear
      :enter-active-class="appearance.overlayEnterActive"
      :leave-active-class="appearance.overlayLeaveActive"
      :enter-from-class="appearance.overlayEnterFrom"
      :leave-to-class="appearance.overlayLeaveTo"
      @enter="activateOverlay"
      @after-leave="finishClose">
      <dialog
        v-if="open"
        ref="host"
        :class="[style.uiOverlay, appearance.uiOverlay]"
        @cancel.prevent="$emit('close')"
        @pointerdown="backdropDown"
        @click="backdropClick">
        <section
          ref="panel"
          @pointerdown="startDrag"
          @pointermove="moveDrag"
          @pointerup="endPointerDrag"
          @pointercancel="cancelPointerDrag"
          @touchstart.passive="startTouch"
          @touchmove="moveTouch"
          @touchend="endDrag"
          @touchcancel="cancelDrag"
          :class="[
            style.uiDialog,
            appearance.uiDialog,
            wide && style.uiDialogWide,
            dragging && style.isDragging,
          ]"
          :style="{ '--sheet-offset': `${dragOffset}px` }">
          <div :class="style.uiSheetHandle">
            <span />
          </div>
          <header :class="[style.uiDialogHeader, appearance.uiDialogHeader]">
            <h2>{{ title }}</h2>
            <Button
              variant="ghost"
              icon-only
              @click="$emit('close')">
              <PhX />
            </Button>
          </header>
          <div
            ref="body"
            :class="style.uiDialogBody">
            <slot />
          </div>
        </section>
      </dialog>
    </Transition>
  </Teleport>
</template>
<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import style from './ModalBase.module.scss'
import Button from '../Button/ButtonStyle.vue'
import { componentProps } from './Modal.props'
import { createOverlayController } from '@/utils/overlay'
import type { OverlayController } from '@/utils/overlay.types'

export default defineComponent({
  name: 'ModalBase',
  components: { Button, PhX },
  props: componentProps,
  emits: ['close'],
  data() {
    return {
      style,
      overlay: null as OverlayController | null,
      dragStart: 0,
      dragTime: 0,
      dragOffset: 0,
      dragging: false,
      trackingTouch: false,
      touchStartX: 0,
      backdropPressed: false,
    }
  },
  mounted() {
    this.overlay = markRaw(
      createOverlayController(
        () => this.$refs.panel as HTMLElement,
        () => this.$emit('close'),
        true,
      ),
    )
    if (this.open) this.activateOverlay()
  },
  beforeUnmount() {
    this.overlay?.close()
  },
  methods: {
    activateOverlay() {
      const host = this.$refs.host as HTMLDialogElement | undefined
      if (!host || !this.open || !this.overlay) return
      this.overlay.open()
      if (!host.open) host.showModal()
    },
    finishClose() {
      if (this.open) return
      this.overlay?.close()
      this.cancelDrag()
    },
    canStartDrag(target: EventTarget | null) {
      if (!window.matchMedia('(max-width: 600px)').matches || !(target instanceof Element))
        return false
      if (target.closest('button, input, select, textarea, a, label, [contenteditable]'))
        return false
      const body = this.$refs.body as HTMLElement | undefined
      return !body || !body.contains(target) || body.scrollTop === 0
    },
    startDrag(event: PointerEvent) {
      if (event.pointerType === 'touch' || event.button !== 0 || !this.canStartDrag(event.target))
        return
      this.dragStart = event.clientY
      this.dragTime = performance.now()
      this.dragging = true
      const panel = event.currentTarget as HTMLElement
      panel.setPointerCapture(event.pointerId)
    },
    moveDrag(event: PointerEvent) {
      if (event.pointerType !== 'touch' && this.dragging) {
        this.dragOffset = Math.max(0, event.clientY - this.dragStart)
      }
    },
    endPointerDrag(event: PointerEvent) {
      if (event.pointerType !== 'touch') this.endDrag()
    },
    cancelPointerDrag(event: PointerEvent) {
      if (event.pointerType !== 'touch') this.cancelDrag()
    },
    startTouch(event: TouchEvent) {
      this.cancelDrag()
      const touch = event.touches[0]
      if (event.touches.length !== 1 || !touch || !this.canStartDrag(event.target)) return
      this.trackingTouch = true
      this.touchStartX = touch.clientX
      this.dragStart = touch.clientY
      this.dragTime = performance.now()
    },
    moveTouch(event: TouchEvent) {
      if (!this.trackingTouch) return
      const touch = event.touches[0]
      if (event.touches.length !== 1 || !touch) {
        this.cancelDrag()
        return
      }
      const offset = touch.clientY - this.dragStart
      const horizontal = Math.abs(touch.clientX - this.touchStartX)
      if (!this.dragging) {
        if (Math.abs(offset) < 6 && horizontal < 6) return
        if (offset <= 0 || horizontal > offset) {
          this.cancelDrag()
          return
        }
      }
      if (!event.cancelable) {
        this.cancelDrag()
        return
      }
      event.preventDefault()
      this.dragging = true
      this.dragOffset = Math.max(0, offset)
    },
    endDrag() {
      this.trackingTouch = false
      if (!this.dragging) return
      this.dragging = false
      const velocity = this.dragOffset / Math.max(1, performance.now() - this.dragTime)
      if (this.dragOffset > 110 || (this.dragOffset > 35 && velocity > 0.5)) this.$emit('close')
      else this.dragOffset = 0
    },
    cancelDrag() {
      this.trackingTouch = false
      this.dragging = false
      this.dragOffset = 0
    },
    backdropDown(event: PointerEvent) {
      this.backdropPressed = event.target === event.currentTarget
    },
    backdropClick(event: MouseEvent) {
      if (this.backdropPressed && event.target === event.currentTarget) this.$emit('close')
      this.backdropPressed = false
    },
  },
})
</script>
