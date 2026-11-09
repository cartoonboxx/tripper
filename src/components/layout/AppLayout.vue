<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './AppLayout.module.scss'
import { defineComponent } from 'vue'
import {
  PhSquaresFour,
  PhBell,
  PhCaretDown,
  PhCaretRight,
  PhCompass,
  PhGearSix,
  PhArrowRight,
  PhSun,
  PhWifiSlash,
} from '@phosphor-icons/vue'
import { Button, Avatar, Modal } from '@/components/ui'
import MobileNavigation from './MobileNavigation/MobileNavigation.vue'
import { navigation } from '@/data/navigation.data'
import { useTravelStore } from '@/stores/travel'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'AppLayout',
  components: {
    PhSquaresFour,
    PhBell,
    PhCaretDown,
    PhCaretRight,
    PhCompass,
    PhGearSix,
    PhArrowRight,
    PhSun,
    PhWifiSlash,
    Button,
    Avatar,
    Modal,
    MobileNavigation,
  },
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      notifications: false,
      online: navigator.onLine,
      PhBell: markRawValue(PhBell),
      PhCaretDown: markRawValue(PhCaretDown),
      PhCaretRight: markRawValue(PhCaretRight),
      PhCompass: markRawValue(PhCompass),
      PhGearSix: markRawValue(PhGearSix),
      PhArrowRight: markRawValue(PhArrowRight),
      PhSun: markRawValue(PhSun),
      PhWifiSlash: markRawValue(PhWifiSlash),
      navigation: markRawValue(navigation),
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    route() {
      return this.$route
    },
  },
  methods: {
    isCurrent(to: string) {
      return to === '/' ? this.route.path === '/' : this.route.path.startsWith(to)
    },
    updateOnline() {
      this.online = navigator.onLine
    },
  },
  mounted() {
    window.addEventListener('online', this.updateOnline)
    window.addEventListener('offline', this.updateOnline)
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnline)
    window.removeEventListener('offline', this.updateOnline)
  },
})
</script>

<template>
  <div :class="[style.appLayout]">
    <aside :class="[style.sidebar]">
      <AppLink
        to="/"
        title="Tripper — главная"
        :class="[style.brand]">
        Tripper
        <span :class="[style.brandDot]">.</span>
      </AppLink>
      <div :class="[style.workspaceLabel]">ЛИЧНОЕ ПРОСТРАНСТВО</div>
      <nav :class="[style.mainNavigation]">
        <AppLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="{ [style.isCurrent || '']: isCurrent(item.to) }">
          <component
            :is="item.icon"
            :size="22" />
          <span>{{ item.label }}</span>
          <span
            v-if="item.to === '/trips'"
            :class="[style.navCount]">
            {{ store.trips.filter((t) => !t.archived).length }}
          </span>
        </AppLink>
      </nav>
      <div :class="[style.sidebarBottom]">
        <div :class="[style.sidebarTip]">
          <span :class="[style.tipIcon]">
            <PhCompass :size="24" />
          </span>
          <strong>
            Хорошие поездки
            <br />
            начинаются с плана
          </strong>
          <p>
            Соберите всё важное
            <br />
            в одном месте.
          </p>
          <AppLink to="/trips">
            К путешествиям
            <PhArrowRight :size="18" />
          </AppLink>
        </div>
        <AppLink
          to="/settings"
          :class="[style.settingsLink]">
          <PhGearSix :size="22" />
          Настройки
        </AppLink>
        <AppLink
          to="/ui-kit"
          :class="style.settingsLink">
          <PhSquaresFour :size="22" />
          UI-kit
        </AppLink>
        <div :class="[style.sidebarFooter]">
          Ваш следующий маршрут — впереди
          <span>✦</span>
        </div>
      </div>
    </aside>
    <div :class="[style.appMain]">
      <header :class="[style.topbar]">
        <AppLink
          to="/"
          :class="[style.mobileBrand]">
          Tripper
          <span>.</span>
        </AppLink>
        <div :class="[style.topbarBreadcrumb]">
          <span>Моё пространство</span>
          <PhCaretRight :size="16" />
          <span :class="[style.breadcrumbCurrent]">{{ route.meta.section || 'Поездки' }}</span>
        </div>
        <div :class="[style.topbarActions]">
          <span :class="[style.localTime]">
            <PhSun :size="18" />
            Время планировать новое
          </span>
          <Button
            variant="ghost"
            icon-only
            title="Уведомления"
            @click="notifications = true"
            :class="[style.notificationButton]">
            <PhBell :size="22" />
            <span
              v-if="store.profile.notifications"
              :class="[style.notificationDot]" />
          </Button>
          <span :class="[style.topbarDivider]" />
          <AppLink
            to="/settings"
            title="Настройки профиля"
            :class="[style.profileLink]">
            <Avatar
              :name="store.profile.name"
              color="#e9dfcf" />
            <span>{{ store.profile.name }}</span>
            <PhCaretDown :size="16" />
          </AppLink>
        </div>
      </header>
      <div
        v-if="!online"
        :class="[style.offlineBanner]">
        <PhWifiSlash :size="20" />
        Вы офлайн. Изменения сохраняются на этом устройстве.
      </div>
      <div
        v-if="store.storageError"
        :class="[style.offlineBanner]">
        Не удалось сохранить данные. Проверьте свободное место в браузере.
      </div>
      <main :class="[style.mainContent]"><RouterView /></main>
      <footer :class="[style.appFooter]">
        <span>Tripper — больше впечатлений, меньше забот</span>
        <span>Планируйте. Исследуйте. Вдохновляйтесь.</span>
      </footer>
    </div>
    <MobileNavigation />
    <Modal
      :open="notifications"
      title="Уведомления"
      @close="notifications = false">
      <div :class="[style.notificationItem]">
        <span :class="[style.softIcon]"><PhCompass /></span>
        <div>
          <strong>Путешествие начинается здесь</strong>
          <p>Создайте поездку, добавьте любимые места и пригласите друзей.</p>
        </div>
      </div>
    </Modal>
  </div>
</template>
