<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './MobileNavigation.module.scss'
import { defineComponent } from 'vue'
import { PhDotsThree, PhCaretRight } from '@phosphor-icons/vue'
import { Modal } from '@/components/ui'
import { mobileNavigation, moreNavigation } from '@/data/navigation.data'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'MobileNavigation',
  components: { PhDotsThree, PhCaretRight, Modal },
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      moreOpen: false,
      PhDotsThree: markRawValue(PhDotsThree),
      PhCaretRight: markRawValue(PhCaretRight),
      mobileNavigation: markRawValue(mobileNavigation),
      moreNavigation: markRawValue(moreNavigation),
    }
  },
  computed: {
    route() {
      return this.$route
    },
    moreActive() {
      return this.moreNavigation.some((item) => this.isCurrent(item.to))
    },
  },
  methods: {
    isCurrent(to: string) {
      return to === '/' ? this.route.path === '/' : this.route.path.startsWith(to)
    },
  },
})
</script>

<template>
  <nav
    title="Мобильная навигация"
    :class="[style.mobileNavigation]">
    <AppLink
      v-for="item in mobileNavigation"
      :key="item.to"
      :to="item.to"
      :class="[style.mobileNavigationTab, { [style.isActive || '']: isCurrent(item.to) }]">
      <span :class="[style.mobileNavigationIcon]">
        <component
          :is="item.icon"
          :size="24"
          :weight="isCurrent(item.to) ? 'fill' : 'regular'" />
      </span>
      <span>{{ item.label }}</span>
    </AppLink>
    <button
      type="button"
      :class="[style.mobileNavigationTab, { [style.isActive || '']: moreActive || moreOpen }]"
      @click="moreOpen = true">
      <span :class="[style.mobileNavigationIcon]">
        <PhDotsThree
          :size="28"
          weight="bold" />
      </span>
      <span>Ещё</span>
    </button>
  </nav>
  <Modal
    :open="moreOpen"
    title="Ещё в Tripper"
    @close="moreOpen = false">
    <nav
      title="Дополнительные разделы"
      :class="[style.mobileMoreNavigation]">
      <AppLink
        v-for="item in moreNavigation"
        :key="item.to"
        :to="item.to"
        :class="{ [style.isCurrent || '']: isCurrent(item.to) }"
        @click="moreOpen = false">
        <component
          :is="item.icon"
          :size="24" />
        <span>{{ item.label }}</span>
        <PhCaretRight :size="18" />
      </AppLink>
    </nav>
  </Modal>
</template>
