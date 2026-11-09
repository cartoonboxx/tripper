<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './DrawerBase.module.scss'
import modalStyle from '../Modal/ModalBase.module.scss'
import { defineComponent, markRaw } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import Button from '../Button/ButtonStyle.vue'
import { componentProps } from './Drawer.props'
import { createOverlayController } from '@/utils/overlay'
import type { OverlayController } from '@/utils/overlay.types'

export default defineComponent({
  name: 'DrawerBase',
  components: { Button, PhX },
  props: componentProps,
  emits: ['close'],
  data() {
    return {
      style: mergeStyles(sharedStyle, modalStyle, style),
      overlay: null as OverlayController | null,
    }
  },
  watch: {
    open(open: boolean) {
      if (open) this.activateOverlay()
      else this.overlay?.close()
    },
  },
  mounted() {
    this.overlay = markRaw(
      createOverlayController(
        () => this.$refs.panel as HTMLElement,
        () => this.$emit('close'),
      ),
    )
    if (this.open) this.activateOverlay()
  },
  beforeUnmount() {
    this.overlay?.close()
  },
  methods: {
    async activateOverlay() {
      await this.$nextTick()
      if (this.open) this.overlay?.open()
    },
  },
})
</script>
<template>
  <Teleport to="body">
    <Transition
      :enter-active-class="appearance.overlayEnterActive"
      :leave-active-class="appearance.overlayLeaveActive"
      :enter-from-class="appearance.overlayEnterFrom"
      :leave-to-class="appearance.overlayLeaveTo">
      <div
        v-if="open"
        @mousedown.self="$emit('close')"
        :class="[
          style.uiOverlay,
          appearance.uiOverlay,
          style.uiDrawerOverlay,
          appearance.uiDrawerOverlay,
        ]">
        <dialog
          open
          ref="panel"
          :class="[
            style.uiDialog,
            appearance.uiDialog,
            style.uiDrawer,
            appearance.uiDrawer,
            { [style.uiDialogWide || '']: false },
          ]">
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
          <slot />
        </dialog>
      </div>
    </Transition>
  </Teleport>
</template>
