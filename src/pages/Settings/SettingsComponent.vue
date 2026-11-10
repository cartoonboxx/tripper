<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './SettingsComponent.module.scss'
import { defineComponent } from 'vue'
import { PhCheck, PhLockKey, PhSignOut, PhUser } from '@phosphor-icons/vue'
import { useTravelStore } from '@/stores/travel'
import { Card, Input, Button, Avatar, Switch, Modal } from '@/components/ui'

export default defineComponent({
  name: 'SettingsComponent',
  components: {
    SectionHeader,
    PhCheck,
    PhLockKey,
    PhSignOut,
    PhUser,
    Card,
    Input,
    Button,
    Avatar,
    Switch,
    Modal,
  },
  data() {
    return {
      sharedStyle,
      style,
      form: { ...useTravelStore().profile },
      logout: false,
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    router() {
      return this.$router
    },
  },
  methods: {
    signOut() {
      this.store.session = false
      this.router.push('/login')
    },
    save() {
      Object.assign(this.store.profile, { ...this.form, name: this.form.name.trim() })
      for (const member of this.store.participants) {
        if (member.email === this.store.profile.email || member.role === 'organizer') {
          member.name = this.form.name
          member.email = this.form.email
        }
      }
      this.store.notify('Профиль обновлён')
    },
  },
})
</script>
<template>
  <div :class="style.settingsPage">
    <SectionHeader
      header="Настройки"
      level="h1"
      paragraph="Немного о вас и о том, как вам удобнее планировать." />
    <Card :class="style.settingsCard">
      <div :class="style.settingsSectionTitle">
        <PhUser :size="19" />
        <h3>Личный профиль</h3>
      </div>
      <div :class="style.settingsAvatar">
        <Avatar
          :name="form.name"
          size="lg"
          color="#e9dfcf" />
        <div>
          <strong>{{ store.profile.name }}</strong>
          <p>Собиратель впечатлений</p>
        </div>
      </div>
      <form
        @submit.prevent="save"
        :class="sharedStyle.formStack">
        <div :class="sharedStyle.formRow">
          <Input
            v-model="form.name"
            label="Ваше имя"
            required
            autocomplete="name" />
          <Input
            v-model="form.email"
            label="Электронная почта"
            type="email"
            required
            autocomplete="email" />
        </div>
        <div :class="style.settingsPreference">
          <div>
            <strong>Уведомления в приложении</strong>
            <p>Напоминания о планах и новых возможностях.</p>
          </div>
          <Switch
            v-model="form.notifications"
            label="Уведомления в приложении" />
        </div>
        <div :class="sharedStyle.formActions">
          <Button type="submit">
            <PhCheck :size="16" />
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Card>
    <Card :class="style.settingsCard">
      <div :class="style.settingsSectionTitle">
        <PhLockKey :size="19" />
        <h3>Управление аккаунтом</h3>
      </div>
      <p :class="sharedStyle.subtle">
        Это локальная версия Tripper. Планы сохраняются в вашем браузере. Авторизация и
        синхронизация между устройствами требуют подключения сервера.
      </p>
      <div :class="style.settingsAccountRow">
        <div>
          <strong>Завершить сеанс</strong>
          <p>Ваши поездки останутся на этом устройстве.</p>
        </div>
        <Button
          variant="secondary"
          @click="logout = true">
          <PhSignOut :size="16" />
          Выйти
        </Button>
      </div>
    </Card>
    <Modal
      :open="logout"
      title="Выйти из аккаунта?"
      @close="logout = false">
      <p :class="sharedStyle.subtle">Вы сможете вернуться к своим планам на этом устройстве.</p>
      <div :class="sharedStyle.formActions">
        <Button
          variant="secondary"
          @click="logout = false">
          Остаться
        </Button>
        <Button @click="signOut">Выйти</Button>
      </div>
    </Modal>
  </div>
</template>
