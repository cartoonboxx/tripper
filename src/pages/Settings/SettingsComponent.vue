<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './SettingsComponent.module.scss'
import { defineComponent } from 'vue'
import { PhCheck, PhLockKey, PhSignOut, PhUser } from '@phosphor-icons/vue'
import { useTravelStore } from '@/stores/travel'
import { Card, Input, Button, Avatar, Switch, Modal } from '@/components/ui'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'SettingsComponent',
  components: { PhCheck, PhLockKey, PhSignOut, PhUser, Card, Input, Button, Avatar, Switch, Modal },
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      form: { ...useTravelStore().profile },
      logout: false,
      PhCheck: markRawValue(PhCheck),
      PhLockKey: markRawValue(PhLockKey),
      PhSignOut: markRawValue(PhSignOut),
      PhUser: markRawValue(PhUser),
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
  <div :class="[style.settingsPage]">
    <header :class="[style.pageHeading]">
      <div>
        <span :class="[style.eyebrow]">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</span>
        <h1>Настройки</h1>
        <p>Немного о вас и о том, как вам удобнее планировать.</p>
      </div>
    </header>
    <Card :class="[style.settingsCard]">
      <div :class="[style.settingsSectionTitle]">
        <PhUser :size="19" />
        <h3>Личный профиль</h3>
      </div>
      <div :class="[style.settingsAvatar]">
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
        :class="[style.formStack]">
        <div :class="[style.formRow]">
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
        <div :class="[style.settingsPreference]">
          <div>
            <strong>Уведомления в приложении</strong>
            <p>Напоминания о планах и новых возможностях.</p>
          </div>
          <Switch
            v-model="form.notifications"
            label="Уведомления в приложении" />
        </div>
        <div :class="[style.formActions]">
          <Button type="submit">
            <PhCheck :size="16" />
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Card>
    <Card :class="[style.settingsCard]">
      <div :class="[style.settingsSectionTitle]">
        <PhLockKey :size="19" />
        <h3>Управление аккаунтом</h3>
      </div>
      <p :class="[style.subtle]">
        Это локальная версия Tripper. Планы сохраняются в вашем браузере. Авторизация и
        синхронизация между устройствами требуют подключения сервера.
      </p>
      <div :class="[style.settingsAccountRow]">
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
      <p :class="[style.subtle]">Вы сможете вернуться к своим планам на этом устройстве.</p>
      <div :class="[style.formActions]">
        <Button
          variant="secondary"
          @click="logout = false">
          Остаться
        </Button>
        <Button
          @click="
            () => {
              store.session = false
              router.push('/login')
            }
          ">
          Выйти
        </Button>
      </div>
    </Modal>
  </div>
</template>
