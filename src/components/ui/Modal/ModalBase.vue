<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
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
      style: mergeStyles(sharedStyle, style),
      overlay: null as OverlayController | null,
      dragStart: 0,
      dragTime: 0,
      dragOffset: 0,
      dragging: false,
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
      this.overlay?.open()
      if (!host.open) host.showModal()
    },
    finishClose() {
      if (this.open) return
      this.overlay?.close()
      this.dragOffset = 0
      this.dragging = false
    },
    startDrag(event: PointerEvent) {
      if (!window.matchMedia('(max-width: 600px)').matches) return
      this.dragStart = event.clientY
      this.dragTime = performance.now()
      this.dragging = true
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    },
    moveDrag(event: PointerEvent) {
      if (this.dragging) this.dragOffset = Math.max(0, event.clientY - this.dragStart)
    },
    endDrag() {
      if (!this.dragging) return
      this.dragging = false
      const velocity = this.dragOffset / Math.max(1, performance.now() - this.dragTime)
      if (this.dragOffset > 110 || (this.dragOffset > 35 && velocity > 0.5)) this.$emit('close')
      else this.dragOffset = 0
    },
    cancelDrag() {
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
          :class="[
            style.uiDialog,
            appearance.uiDialog,
            { [style.uiDialogWide || '']: wide, [style.isDragging || '']: dragging },
          ]"
          :style="{ '--sheet-offset': `${dragOffset}px` }">
          <div
            :class="style.uiSheetHandle"
            @pointerdown="startDrag"
            @pointermove="moveDrag"
            @pointerup="endDrag"
            @pointercancel="cancelDrag">
            <span />
          </div>
          <header :class="[style.uiDialogHeader, appearance.uiDialogHeader]">
            <h2>{{ title }}</h2>
            <Button
              variant="ghost"
              icon-only
              title="Закрыть"
              @click="$emit('close')">
              <PhX />
            </Button>
          </header>
          <div :class="style.uiDialogBody"><slot /></div>
        </section>
      </dialog>
    </Transition>
  </Teleport>
</template>
