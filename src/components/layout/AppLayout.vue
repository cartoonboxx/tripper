<template>
  <div :class="style.appLayout">
    <aside :class="style.sidebar">
      <AppLink
        to="/"
        :class="style.brand">
        Tripper
        <span :class="style.brandDot">.</span>
      </AppLink>
      <nav :class="style.mainNavigation">
        <AppLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="{ [style.isCurrent || '']: isCurrent(item.to) }">
          <component
            :is="item.icon"
            :size="22" />
          <span>{{ item.label }}</span>
        </AppLink>
      </nav>
      <div :class="style.sidebarBottom">
        <div :class="style.sidebarTip">
          <span :class="style.tipIcon">
            <PhCompass :size="24" />
          </span>
          <strong>Хорошие поездки начинаются с плана</strong>
          <p>Соберите всё важное в одном месте.</p>
          <AppLink to="/trips">
            К путешествиям
            <PhArrowRight :size="18" />
          </AppLink>
        </div>
        <AppLink
          to="/settings"
          :class="style.settingsLink">
          <PhGearSix :size="22" />
          Настройки
        </AppLink>
      </div>
    </aside>
    <div :class="style.appMain">
      <header :class="style.topbar">
        <AppLink
          to="/"
          :class="style.mobileBrand">
          Tripper
          <span>.</span>
        </AppLink>
        <div :class="style.topbarBreadcrumb">
          <span>Навигация</span>
          <PhCaretRight :size="16" />
          <span :class="style.breadcrumbCurrent">{{ route.meta.section || 'Поездки' }}</span>
        </div>
        <div :class="style.topbarActions">
          <span :class="style.localTime">
            <PhSun :size="18" />
            Время планировать новое
          </span>
          <Button
            variant="ghost"
            icon-only
            @click="notifications = true"
            :class="style.notificationButton">
            <PhBell :size="22" />
            <span
              v-if="store.profile.notifications"
              :class="style.notificationDot" />
          </Button>
          <span :class="style.topbarDivider" />
          <FloatingPopup
            v-model:open="userPopup"
            placement="bottom-end">
            <template #target>
              <div :class="style.profileButton">
                <Avatar
                  :name="store.profile.name"
                  color="#e9dfcf" />
                <span :class="style.profileName">{{ store.profile.name }}</span>
                <PhCaretDown
                  :size="16"
                  :class="[style.profileCaret, userPopup && style.isOpen]" />
              </div>
            </template>
            <template #default="{ close }">
              <Button
                to="/settings"
                variant="ghost"
                @click="close">
                <PhUser :size="20" />
                Открыть профиль
              </Button>
              <Button
                variant="danger"
                @click="signOut">
                <PhSignOut :size="20" />
                Выйти
              </Button>
            </template>
          </FloatingPopup>
        </div>
      </header>
      <div
        v-if="!online"
        :class="style.offlineBanner">
        <PhWifiSlash :size="20" />
        Вы офлайн. Изменения сохраняются на этом устройстве.
      </div>
      <div
        v-if="store.storageError"
        :class="style.offlineBanner">
        Не удалось сохранить данные. Проверьте свободное место в браузере.
      </div>
      <main :class="style.mainContent"><RouterView /></main>
      <footer :class="style.appFooter">
        <span>Tripper — больше впечатлений, меньше забот</span>
        <span>Планируйте. Исследуйте. Вдохновляйтесь.</span>
      </footer>
    </div>
    <MobileNavigation />
    <Modal
      :open="notifications"
      title="Уведомления"
      @close="notifications = false">
      <div :class="style.notificationItem">
        <span :class="sharedStyle.softIcon"><PhCompass /></span>
        <div>
          <strong>Путешествие начинается здесь</strong>
          <p>Создайте поездку, добавьте любимые места и пригласите друзей.</p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
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
  PhUser,
  PhSignOut,
} from '@phosphor-icons/vue'
import { Button, Avatar, Modal, FloatingPopup } from '@/components/ui'
import MobileNavigation from './MobileNavigation/MobileNavigation.vue'
import { navigation } from '@/data/navigation.data'
import { useTravelStore } from '@/stores/travel'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'AppLayout',
  components: {
    FloatingPopup,
    PhSquaresFour,
    PhBell,
    PhCaretDown,
    PhCaretRight,
    PhCompass,
    PhGearSix,
    PhArrowRight,
    PhSun,
    PhWifiSlash,
    PhUser,
    PhSignOut,
    Button,
    Avatar,
    Modal,
    MobileNavigation,
  },
  data() {
    return {
      sharedStyle,
      style,
      notifications: false,
      userPopup: false,
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
  watch: {
    '$route.fullPath'() {
      this.userPopup = false
    },
  },
  methods: {
    signOut() {
      this.userPopup = false
      this.store.session = false
      this.$router.push('/login')
    },
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
