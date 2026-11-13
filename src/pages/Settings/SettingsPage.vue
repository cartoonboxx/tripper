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
      <SectionHeader
        :header="store.passwordCredential ? 'Смена пароля' : 'Пароль для входа'"
        level="h2"
        paragraph="Пароль используется для входа на этом устройстве." />
      <form
        @submit.prevent="changePassword"
        :class="sharedStyle.formStack">
        <Input
          v-if="store.passwordCredential"
          v-model="passwordForm.current"
          type="password"
          label="Текущий пароль"
          autocomplete="current-password"
          required
          :disabled="passwordSaving" />
        <div :class="sharedStyle.formRow">
          <Input
            v-model="passwordForm.next"
            type="password"
            label="Новый пароль"
            autocomplete="new-password"
            minlength="8"
            placeholder="Не менее 8 символов"
            required
            :disabled="passwordSaving" />
          <Input
            v-model="passwordForm.confirmation"
            type="password"
            label="Повторите новый пароль"
            autocomplete="new-password"
            minlength="8"
            required
            :disabled="passwordSaving" />
        </div>
        <p
          v-if="passwordError"
          :class="sharedStyle.errorText">
          {{ passwordError }}
        </p>
        <div :class="sharedStyle.formActions">
          <Button
            type="submit"
            :disabled="passwordSaving">
            {{
              passwordSaving
                ? 'Сохранение…'
                : store.passwordCredential
                  ? 'Изменить пароль'
                  : 'Задать пароль'
            }}
          </Button>
        </div>
      </form>
    </Card>
    <SectionHeader
      header="Категории"
      level="h2"
      paragraph="Свои категории для расходов, мест и событий. Удаление категории не меняет сохранённые записи." />
    <section
      v-for="domain in categoryDomains"
      :key="domain.value">
      <Card :class="style.settingsCard">
        <SectionHeader
          :header="domain.label"
          level="h3" />
        <div :class="style.categories">
          <Badge
            v-for="category in defaultCategories[domain.value]"
            :key="category"
            variant="neutral">
            {{ category }}
          </Badge>
        </div>
        <ul
          v-if="customCategories(domain.value).length"
          :class="style.customCategories">
          <li
            v-for="category in customCategories(domain.value)"
            :key="category">
            <span>{{ category }}</span>
            <Button
              variant="ghost"
              size="sm"
              @click="removeCategory(domain.value, category)">
              <PhTrash :size="16" />
              Удалить
            </Button>
          </li>
        </ul>
        <form
          @submit.prevent="addCategory(domain.value)"
          :class="style.categoryForm">
          <Input
            v-model="categoryForms[domain.value].name"
            label="Новая категория"
            placeholder="Название категории"
            required
            @update:model-value="categoryForms[domain.value].error = ''" />
          <Button type="submit">Добавить</Button>
          <p
            v-if="categoryForms[domain.value].error"
            :class="[style.categoryError, sharedStyle.errorText]">
            {{ categoryForms[domain.value].error }}
          </p>
        </form>
      </Card>
    </section>
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
<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './SettingsPage.module.scss'
import { defineComponent } from 'vue'
import { categoryDomains, defaultCategories } from '@/data/categories.data'
import type { CategoryDomain } from '@/types/category.types'
import { PhCheck, PhLockKey, PhSignOut, PhUser, PhTrash } from '@phosphor-icons/vue'
import { useTravelStore } from '@/stores/travel'
import { Card, Input, Button, Avatar, Switch, Modal, Badge } from '@/components/ui'

export default defineComponent({
  name: 'SettingsPage',
  components: {
    SectionHeader,
    PhCheck,
    PhLockKey,
    PhSignOut,
    PhUser,
    PhTrash,
    Card,
    Input,
    Button,
    Avatar,
    Switch,
    Modal,
    Badge,
  },
  data() {
    return {
      sharedStyle,
      style,
      form: { ...useTravelStore().profile },
      logout: false,
      passwordForm: { current: '', next: '', confirmation: '' },
      passwordError: '',
      passwordSaving: false,
      categoryDomains,
      defaultCategories,
      categoryForms: {
        expenses: { name: '', error: '' },
        places: { name: '', error: '' },
      },
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
    async changePassword() {
      if (this.passwordSaving) return
      this.passwordError = ''
      if (this.passwordForm.next !== this.passwordForm.confirmation) {
        this.passwordError = 'Новые пароли не совпадают.'
        return
      }
      this.passwordSaving = true
      try {
        this.passwordError = await this.store.changePassword(
          this.passwordForm.current,
          this.passwordForm.next,
        )
        if (this.passwordError) return
        this.passwordForm = { current: '', next: '', confirmation: '' }
        this.store.notify('Пароль сохранён')
      } catch {
        this.passwordError = 'Не удалось сохранить пароль. Попробуйте ещё раз.'
      } finally {
        this.passwordSaving = false
      }
    },
    customCategories(domain: CategoryDomain) {
      return this.store.categories[domain].filter(
        (category) => !defaultCategories[domain].includes(category),
      )
    },
    addCategory(domain: CategoryDomain) {
      const form = this.categoryForms[domain]
      if (!form.name.trim()) {
        form.error = 'Введите название категории.'
        return
      }
      if (!this.store.addCategory(domain, form.name)) {
        form.error = 'Такая категория уже существует.'
        return
      }
      form.name = ''
      form.error = ''
      this.store.notify('Категория добавлена')
    },
    removeCategory(domain: CategoryDomain, name: string) {
      if (this.store.removeCategory(domain, name)) this.store.notify('Категория удалена')
    },
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
