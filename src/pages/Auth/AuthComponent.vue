<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import style from './AuthComponent.module.scss'
import { defineComponent } from 'vue'
import {
  PhArrowRight,
  PhArrowUpRight,
  PhCompass,
  PhInfo,
  PhMapPin,
  PhMountains,
} from '@phosphor-icons/vue'
import { Input, Button, Checkbox } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import florence from '@/assets/images/florence.jpg'

export default defineComponent({
  name: 'AuthComponent',
  components: {
    PhArrowRight,
    PhArrowUpRight,
    PhCompass,
    PhInfo,
    PhMapPin,
    PhMountains,
    Input,
    Button,
    Checkbox,
  },
  data() {
    return {
      sharedStyle,
      style,
      name: '',
      email: '',
      password: '',
      accepted: false,
      error: '',
      florence,
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    router() {
      return this.$router
    },
    route() {
      return this.$route
    },
    register() {
      return this.route.name === 'register'
    },
  },
  methods: {
    submit() {
      if (this.register && !this.accepted) {
        this.error = 'Подтвердите согласие с локальным хранением данных.'
        return
      }
      if (this.register) this.store.profile.name = this.name
      this.store.profile.email = this.email
      this.store.session = true
      this.store.notify(this.register ? 'Добро пожаловать в Tripper' : 'С возвращением!')
      this.router.push('/')
    },
  },
})
</script>
<template>
  <div :class="style.authPage">
    <section :class="style.authFormSide">
      <AppLink
        to="/"
        :class="style.authBrand">
        <PhMountains :size="30" />
        Tripper
        <span>.</span>
      </AppLink>
      <div :class="style.authForm">
        <span :class="[sharedStyle.eyebrow, style.eyebrow]">ПУТЕШЕСТВИЯ НАЧИНАЮТСЯ ЗДЕСЬ</span>
        <h1>{{ register ? 'Ваши планы. Ваши открытия.' : 'Рады видеть вас снова' }}</h1>
        <p :class="style.authIntro">
          {{
            register
              ? 'Соберите все идеи в одном месте — и отправляйтесь навстречу новому.'
              : 'Ваши маршруты, любимые места и будущие впечатления уже ждут.'
          }}
        </p>
        <form
          @submit.prevent="submit"
          :class="sharedStyle.formStack">
          <Input
            v-if="register"
            v-model="name"
            label="Ваше имя"
            placeholder="Как к вам обращаться?"
            required
            autocomplete="name" />
          <Input
            v-model="email"
            label="Электронная почта"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email" />
          <Input
            v-model="password"
            label="Пароль"
            type="password"
            placeholder="Не менее 8 символов"
            minlength="8"
            required
            :autocomplete="register ? 'new-password' : 'current-password'" />
          <Checkbox
            v-if="register"
            v-model="accepted"
            label="Согласен с хранением данных в этом браузере" />
          <p
            v-if="error"
            :class="sharedStyle.errorText">
            {{ error }}
          </p>
          <Button
            type="submit"
            size="lg">
            {{ register ? 'Создать аккаунт' : 'Войти' }}
            <PhArrowRight :size="17" />
          </Button>
        </form>
        <p :class="style.authSwitch">
          {{ register ? 'Уже с нами?' : 'Ещё нет аккаунта?' }}
          <AppLink :to="register ? '/login' : '/register'">
            {{ register ? 'Войти' : 'Зарегистрироваться' }}
          </AppLink>
        </p>
        <div :class="style.authDemo">
          <PhInfo :size="16" />
          <span>
            Демонстрационный вход: данные остаются на этом устройстве, пароль не сохраняется и не
            проверяется сервером.
          </span>
        </div>
        <AppLink
          to="/"
          :class="style.authGuest">
          Посмотреть без входа
          <PhArrowUpRight :size="16" />
        </AppLink>
      </div>
      <footer>Меньше забот. Больше путешествий.</footer>
    </section>
    <section
      :style="{ backgroundImage: `url(${florence})` }"
      :class="style.authVisual">
      <div :class="style.authVisualTop">
        <PhCompass :size="24" />
        <span>ДЛЯ ТЕХ, КТО ЛЮБИТ ОТКРЫВАТЬ</span>
      </div>
      <div :class="style.authQuote">
        <span>43°46′ с. ш. 11°15′ в. д.</span>
        <h2>
          Большие впечатления.
          <br />
          Продуманные мелочи.
        </h2>
        <p>
          Планируйте вместе, исследуйте в своём ритме.
          <br />
          А всё важное мы поможем сохранить.
        </p>
        <div>
          <PhMapPin :size="16" />
          Флоренция, Италия
        </div>
      </div>
    </section>
  </div>
</template>
