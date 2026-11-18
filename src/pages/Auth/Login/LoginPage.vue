<template>
  <AuthLayout>
    <SectionHeader
      header="Рады видеть вас снова"
      paragraph="Ваши маршруты, любимые места и будущие впечатления уже ждут."
      level="h1"
      :class="style.authHeading" />
    <form
      @submit.prevent="submit"
      :class="sharedStyle.formStack">
      <Input
        v-model="email"
        :label="usesUsername ? 'Имя пользователя' : 'Электронная почта'"
        :type="usesUsername ? 'text' : 'email'"
        :placeholder="usesUsername ? 'Ваше имя пользователя' : 'you@example.com'"
        required
        :autocomplete="usesUsername ? 'username' : 'email'" />
      <Input
        v-model="password"
        label="Пароль"
        type="password"
        placeholder="Не менее 8 символов"
        minlength="8"
        required
        autocomplete="current-password" />
      <p
        v-if="error"
        :class="sharedStyle.errorText">
        {{ error }}
      </p>
      <Button
        type="submit"
        size="lg"
        :disabled="submitting">
        Войти
        <PhArrowRight :size="17" />
      </Button>
    </form>
    <p :class="style.authSwitch">
      Ещё нет аккаунта?
      <AppLink to="/registration">Зарегистрироваться</AppLink>
    </p>
  </AuthLayout>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { PhArrowRight } from '@phosphor-icons/vue'
import AuthLayout from '@/components/auth/AuthLayout/AuthLayout.vue'
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { Input, Button } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import { verifyPassword } from '@/utils/password'
import sharedStyle from '@/styles/shared.module.scss'
import style from '@/components/auth/AuthLayout/AuthLayout.module.scss'

export default defineComponent({
  name: 'LoginPage',
  components: { AuthLayout, SectionHeader, Input, Button, PhArrowRight },
  data() {
    return {
      style,
      sharedStyle,
      email: '',
      password: '',
      error: '',
      submitting: false,
    }
  },
  computed: {
    usesUsername(): boolean {
      return Boolean(this.store.passwordCredential && !this.store.profile.email.trim())
    },
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
  },
  methods: {
    async submit() {
      if (this.submitting) return
      this.error = ''
      if (this.password.length < 8) {
        this.error = 'Пароль должен содержать не менее 8 символов.'
        return
      }
      const email = this.email.trim()
      const expectedLogin = this.usesUsername ? this.store.profile.name : this.store.profile.email
      const password = this.password
      this.submitting = true
      try {
        if (
          this.store.passwordCredential &&
          (email.toLowerCase() !== expectedLogin.trim().toLowerCase() ||
            !(await verifyPassword(password, this.store.passwordCredential)))
        ) {
          this.error = this.usesUsername
            ? 'Неверное имя пользователя или пароль.'
            : 'Неверная электронная почта или пароль.'
          return
        }
        if (!this.usesUsername) this.store.profile.email = email
        this.store.session = true
        this.password = ''
        this.store.notify('С возвращением!')
        this.$router.push('/')
      } catch {
        this.error = 'Не удалось выполнить вход. Попробуйте ещё раз.'
      } finally {
        this.submitting = false
      }
    },
  },
})
</script>
