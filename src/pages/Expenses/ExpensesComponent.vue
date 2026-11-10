<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ExpensesComponent.module.scss'
import { defineComponent, markRaw } from 'vue'
import { PhAirplaneTilt, PhCoffee, PhPlus, PhUsers, PhWallet, PhX } from '@phosphor-icons/vue'
import { money } from '@/composables/format'
import { expenseCategories } from '@/data/navigation.data'
import { Button, Card, Modal, Input, Select, EmptyState } from '@/components/ui'
import tripContext from '@/mixins/tripContext'
import type { Expense } from '@/types/trip.types'

export default defineComponent({
  name: 'ExpensesComponent',
  components: {
    SectionHeader,
    PhPlus,
    PhWallet,
    PhUsers,
    PhX,
    Button,
    Card,
    Modal,
    Input,
    Select,
    EmptyState,
  },
  mixins: [tripContext],
  data() {
    return {
      sharedStyle,
      style,
      creating: false,
      category: 'all',
      form: { title: '', category: 'Питание', amount: '', tripId: '' },
      PhWallet: markRaw(PhWallet),
      expenseCategories: markRaw(expenseCategories),
      selectedTrip: '',
    }
  },
  computed: {
    canAddExpense() {
      return this.store.editable(this.expenseTripId)
    },
    expenseTripId: {
      get(): string {
        return this.tripId || this.selectedTrip || this.store.trips[0]?.id || ''
      },
      set(value: string) {
        this.selectedTrip = value
        this.category = 'all'
      },
    },
    tripOptions() {
      return this.store.trips.map((trip) => ({ label: trip.name, value: trip.id }))
    },
    tripExpenses() {
      return this.store.expenses.filter((expense) => expense.tripId === this.expenseTripId)
    },
    categoryOptions() {
      return [{ label: 'Все категории', value: 'all' }, ...this.expenseCategories]
    },
    latestExpenses() {
      return [...this.expenses].reverse()
    },
    expenses() {
      return this.tripExpenses.filter(
        (expense) => this.category === 'all' || expense.category === this.category,
      )
    },
    total() {
      return this.tripExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    },
    members() {
      return Math.max(this.store.members(this.expenseTripId).length, 1)
    },
  },
  methods: {
    expenseIcon(category: string) {
      if (category === 'Питание') return PhCoffee
      if (category === 'Транспорт') return PhAirplaneTilt
      return PhWallet
    },
    removeExpense(expense: Expense) {
      if (expense.tripId !== this.expenseTripId || !this.store.editable(expense.tripId)) return
      this.store.expenses = this.store.expenses.filter((current) => current.id !== expense.id)
      this.store.notify('Расход удалён')
    },
    money,
    open() {
      this.form = {
        title: '',
        category: 'Питание',
        amount: '',
        tripId: this.expenseTripId,
      }
      this.creating = true
    },
    save() {
      if (
        this.form.tripId !== this.expenseTripId ||
        !this.store.editable(this.form.tripId) ||
        Number(this.form.amount) <= 0
      )
        return
      this.store.expenses.push({
        ...this.form,
        id: crypto.randomUUID(),
        amount: Number(this.form.amount),
      })
      this.creating = false
      this.store.notify('Расход добавлен')
    },
  },
})
</script>
<template>
  <div>
    <SectionHeader
      :header="tripId ? 'Расходы поездки' : 'Расходы'"
      :level="tripId ? 'h2' : 'h1'"
      :paragraph="!tripId ? 'Выберите поездку, чтобы посмотреть её расходы.' : ''">
      <template #actions>
        <Button
          v-if="canAddExpense"
          :size="tripId ? 'sm' : 'md'"
          @click="open">
          <PhPlus :size="16" />
          Добавить расход
        </Button>
      </template>
    </SectionHeader>
    <Select
      v-if="!tripId"
      v-model="expenseTripId"
      label="Поездка"
      :options="tripOptions"
      :class="style.tripSelector" />
    <div :class="style.expenseSummary">
      <Card :class="style.expenseStat">
        <span>Общие расходы</span>
        <strong>{{ money(total) }}</strong>
        <PhWallet :size="24" />
      </Card>
      <Card :class="[style.expenseStat, style.expenseStatLight]">
        <span>На человека</span>
        <strong>{{ money(Math.round(total / members)) }}</strong>
        <PhUsers :size="24" />
      </Card>
      <Select
        v-model="category"
        label="Категории"
        :options="categoryOptions" />
    </div>
    <div v-if="expenses.length">
      <section :class="sharedStyle.panel">
        <SectionHeader
          header="Последние расходы"
          level="h3">
          <template #actions>
            <span :class="sharedStyle.smallLabel">{{ expenses.length }} записей</span>
          </template>
        </SectionHeader>
        <div
          v-for="expense in latestExpenses"
          :key="expense.id"
          :class="style.expenseRow">
          <span :class="style.expenseCategoryIcon">
            <component
              :is="expenseIcon(expense.category)"
              :size="17" />
          </span>
          <div>
            <strong>{{ expense.title }}</strong>
            <small>{{ expense.category }}</small>
          </div>
          <span :class="style.expenseAmount">{{ money(expense.amount) }}</span>
          <Button
            v-if="store.editable(expense.tripId)"
            variant="ghost"
            icon-only
            @click="removeExpense(expense)">
            <PhX :size="16" />
          </Button>
        </div>
      </section>
    </div>
    <EmptyState
      v-else
      :icon="PhWallet"
      title="Пока без расходов"
      description="Добавьте первые траты, чтобы видеть бюджет поездки." />
    <Modal
      :open="creating"
      title="Добавить расход"
      @close="creating = false">
      <form
        @submit.prevent="save"
        :class="sharedStyle.formStack">
        <Input
          v-model="form.title"
          label="Название"
          placeholder="Например, ужин в ресторане"
          required />
        <Input
          v-model="form.amount"
          label="Сумма, ₽"
          type="number"
          min="1"
          max="100000000"
          required />
        <Select
          v-model="form.category"
          label="Категория"
          :options="expenseCategories" />
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="creating = false">
            Отмена
          </Button>
          <Button type="submit">Добавить</Button>
        </div>
      </form>
    </Modal>
  </div>
</template>
