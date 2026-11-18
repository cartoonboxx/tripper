<template>
  <AuthLayout>
    <template v-if="generatedPassword">
      <SectionHeader
        header="Аккаунт создан"
        paragraph="Сохраните пароль: он понадобится для входа по имени пользователя. Мы показываем его только сейчас."
        level="h1"
        :class="style.authHeading" />
      <div :class="sharedStyle.formStack">
        <Input
          :model-value="store.profile.name"
          label="Имя пользователя"
          readonly
          autocomplete="off" />
        <Input
          :model-value="generatedPassword"
          label="Сгенерированный пароль"
          readonly
          autocomplete="off" />
        <Button
          variant="secondary"
          @click="copyPassword">
          <PhCopy :size="17" />
          {{ passwordCopied ? 'Пароль скопирован' : 'Скопировать пароль' }}
        </Button>
        <p
          v-if="error"
          :class="sharedStyle.errorText">
          {{ error }}
        </p>
        <Button
          to="/"
          size="lg">
          Продолжить
          <PhArrowRight :size="17" />
        </Button>
      </div>
    </template>
    <template v-else>
      <SectionHeader
        header="Ваши планы. Ваши открытия."
        paragraph="Соберите все идеи в одном месте — и отправляйтесь навстречу новому."
        level="h1"
        :class="style.authHeading" />
      <form
        @submit.prevent="submit"
        :class="sharedStyle.formStack">
        <Input
          v-model="name"
          label="Ваше имя"
          placeholder="Как к вам обращаться?"
          :required="!isNameOnly"
          :disabled="isNameOnly"
          autocomplete="name" />
        <Input
          v-model="email"
          label="Электронная почта"
          type="email"
          placeholder="you@example.com"
          :required="!isNameOnly"
          :disabled="isNameOnly"
          autocomplete="email" />
        <Input
          v-model="password"
          label="Пароль"
          type="password"
          placeholder="Не менее 8 символов"
          minlength="8"
          :required="!isNameOnly"
          :disabled="isNameOnly"
          autocomplete="new-password" />

        <span :class="sharedStyle.labelMiddle">или введите только имя</span>

        <Input
          v-model="onlyName"
          label="Введите только имя"
          placeholder="Как к вам обращаться?"
          autocomplete="name" />
        <p :class="sharedStyle.subtle">
          Почта не нужна. Пароль создадим автоматически и покажем после регистрации.
        </p>

        <Checkbox
          v-model="accepted"
          label="Согласен с хранением данных в этом браузере" />
        <p
          v-if="error"
          :class="sharedStyle.errorText">
          {{ error }}
        </p>
        <Button
          type="submit"
          size="lg"
          :disabled="submitting">
          Создать аккаунт
          <PhArrowRight :size="17" />
        </Button>
      </form>
      <p :class="style.authSwitch">
        Уже с нами?
        <AppLink to="/login">Войти</AppLink>
      </p>
    </template>
  </AuthLayout>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { PhArrowRight, PhCopy } from '@phosphor-icons/vue'
import AuthLayout from '@/components/auth/AuthLayout/AuthLayout.vue'
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { Input, Button, Checkbox } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import { generatePassword } from '@/utils/password'
import sharedStyle from '@/styles/shared.module.scss'
import style from '@/components/auth/AuthLayout/AuthLayout.module.scss'

export default defineComponent({
  name: 'RegistrationPage',
  components: { AuthLayout, SectionHeader, Input, Button, Checkbox, PhArrowRight, PhCopy },
  data() {
    return {
      style,
      sharedStyle,
      name: '',
      onlyName: '',
      email: '',
      password: '',
      accepted: false,
      error: '',
      submitting: false,
      generatedPassword: '',
      passwordCopied: false,
    }
  },
  computed: {
    isNameOnly(): boolean {
      return Boolean(this.onlyName.trim())
    },
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
  },
  methods: {
    async copyPassword() {
      this.error = ''
      try {
        await navigator.clipboard.writeText(this.generatedPassword)
        this.passwordCopied = true
      } catch {
        this.error = 'Не удалось скопировать пароль. Выделите и скопируйте его вручную.'
      }
    },
    async submit() {
      if (this.submitting || this.generatedPassword) return
      this.error = ''
      const nameOnly = this.isNameOnly
      const name = nameOnly ? this.onlyName.trim() : this.name.trim()
      if (!name) {
        this.error = 'Укажите имя пользователя.'
        return
      }
      if (!nameOnly && !this.email.trim()) {
        this.error = 'Укажите электронную почту.'
        return
      }
      if (!nameOnly && this.password.length < 8) {
        this.error = 'Пароль должен содержать не менее 8 символов.'
        return
      }
      if (!this.accepted) {
        this.error = 'Подтвердите согласие с локальным хранением данных.'
        return
      }
      const email = nameOnly ? '' : this.email.trim()
      this.submitting = true
      try {
        if (this.store.passwordCredential) {
          this.error = 'На этом устройстве уже есть аккаунт. Войдите в него.'
          return
        }
        const password = nameOnly ? generatePassword() : this.password
        this.error = await this.store.changePassword('', password)
        if (this.error) return
        this.store.profile.name = name
        this.store.profile.email = email
        this.store.session = true
        this.password = ''
        this.store.notify('Добро пожаловать в Tripper')
        if (nameOnly) this.generatedPassword = password
        else this.$router.push('/')
      } catch {
        this.error = 'Не удалось создать аккаунт. Попробуйте ещё раз.'
      } finally {
        this.submitting = false
      }
    },
  },
})
</script>
