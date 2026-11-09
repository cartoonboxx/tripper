<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ExpensesComponent.module.scss'
import { defineComponent } from 'vue'
import {
  PhAirplaneTilt,
  PhCoffee,
  PhListChecks,
  PhPlus,
  PhUsers,
  PhWallet,
  PhX,
} from '@phosphor-icons/vue'
import { money } from '@/composables/format'
import { expenseCategories } from '@/data/navigation.data'
import { Button, Card, Modal, Input, Select, EmptyState } from '@/components/ui'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'ExpensesComponent',
  components: { PhPlus, PhWallet, PhX, Button, Card, Modal, Input, Select, EmptyState },
  mixins: [tripContext],
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      creating: false,
      category: 'all',
      form: { title: '', category: 'Питание', amount: '', tripId: '' },
      PhAirplaneTilt: markRawValue(PhAirplaneTilt),
      PhCoffee: markRawValue(PhCoffee),
      PhListChecks: markRawValue(PhListChecks),
      PhPlus: markRawValue(PhPlus),
      PhUsers: markRawValue(PhUsers),
      PhWallet: markRawValue(PhWallet),
      PhX: markRawValue(PhX),
      expenseCategories: markRawValue(expenseCategories),
      colors: ['#376b59', '#76ab95', '#d2b28c', '#e3ceac', '#d9ded4'],
    }
  },
  computed: {
    expenses() {
      return this.store.expenses.filter(
        (e) =>
          (!this.tripId || e.tripId === this.tripId) &&
          (this.category === 'all' || e.category === this.category),
      )
    },
    total() {
      return this.expenses.reduce((sum, e) => sum + e.amount, 0)
    },
    members() {
      return this.tripId ? Math.max(this.store.members(this.tripId).length, 1) : 1
    },
    categories() {
      return this.expenseCategories.map((c, i) => ({
        ...c,
        color: this.colors[i],
        amount: this.expenses
          .filter((e) => e.category === c.value)
          .reduce((sum, e) => sum + e.amount, 0),
      }))
    },
    gradient() {
      let position = 0
      return `conic-gradient(${this.categories
        .map((c) => {
          const start = position
          position += (c.amount / (this.total || 1)) * 100
          return `${c.color} ${start}% ${position}%`
        })
        .join(',')})`
    },
  },
  methods: {
    money,
    open() {
      Object.assign(this.form, {
        title: '',
        category: 'Питание',
        amount: '',
        tripId:
          this.tripId ||
          this.store.trips.find((t) => t.role === 'organizer' && !t.archived)?.id ||
          '',
      })
      this.creating = true
    },
    save() {
      if (!this.store.editable(this.form.tripId) || Number(this.form.amount) <= 0) return
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
    <header :class="tripId ? [style.sectionHeading] : style.pageHeading">
      <div>
        <span :class="[style.eyebrow]">ВПЕЧАТЛЕНИЯ БЕСЦЕННЫ. ПЛАНЫ — ПРОЗРАЧНЫ</span>
        <component :is="tripId ? 'h2' : 'h1'">Расходы {{ tripId ? 'поездки' : '' }}</component>
        <p v-if="!tripId">Все траты ваших путешествий.</p>
      </div>
      <Button
        v-if="tripId ? canEdit : store.trips.some((t) => t.role === 'organizer')"
        :size="tripId ? 'sm' : 'md'"
        @click="open">
        <PhPlus :size="16" />
        Добавить расход
      </Button>
    </header>
    <div :class="[style.expenseSummary]">
      <Card :class="[style.expenseStat]">
        <span>Общие расходы</span>
        <strong>{{ money(total) }}</strong>
        <PhWallet :size="24" />
      </Card>
      <Card :class="[style.expenseStat, style.expenseStatLight]">
        <span>{{ tripId ? 'На человека' : 'Количество расходов' }}</span>
        <strong>{{ tripId ? money(Math.round(total / members)) : expenses.length }}</strong>
        <component
          :is="tripId ? PhUsers : PhListChecks"
          :size="24" />
      </Card>
      <Select
        v-model="category"
        label="Категории"
        :options="[{ label: 'Все категории', value: 'all' }, ...expenseCategories]" />
    </div>
    <div
      v-if="expenses.length"
      :class="[style.twoColumn, style.expenseLayout]">
      <section :class="[style.panel]">
        <div :class="[style.sectionHeading]"><h3>На что уходит бюджет</h3></div>
        <div :class="[style.expenseChartLayout]">
          <div
            :style="{ background: gradient }"
            :title="`Расходы по категориям. Всего ${money(total)}`"
            :class="[style.donut]">
            <span>
              <small>Всего</small>
              <strong>{{ money(total) }}</strong>
            </span>
          </div>
          <div :class="[style.chartLegend]">
            <div
              v-for="item in categories.filter((c) => c.amount)"
              :key="item.value">
              <i :style="{ background: item.color }" />
              <span>{{ item.label }}</span>
              <strong>{{ money(item.amount) }}</strong>
              <small>{{ Math.round((item.amount / (total || 1)) * 100) }}%</small>
            </div>
          </div>
        </div>
      </section>
      <section :class="[style.panel]">
        <div :class="[style.sectionHeading]">
          <h3>Последние расходы</h3>
          <span :class="[style.smallLabel]">{{ expenses.length }} записей</span>
        </div>
        <div
          v-for="expense in [...expenses].reverse()"
          :key="expense.id"
          :class="[style.expenseRow]">
          <span :class="[style.expenseCategoryIcon]">
            <component
              :is="
                expense.category === 'Питание'
                  ? PhCoffee
                  : expense.category === 'Транспорт'
                    ? PhAirplaneTilt
                    : PhWallet
              "
              :size="17" />
          </span>
          <div>
            <strong>{{ expense.title }}</strong>
            <small>{{ expense.category }}</small>
          </div>
          <span :class="[style.expenseAmount]">{{ money(expense.amount) }}</span>
          <Button
            v-if="store.editable(expense.tripId)"
            variant="ghost"
            icon-only
            :title="`Удалить расход ${expense.title}`"
            @click="
              () => {
                store.expenses = store.expenses.filter((e) => e.id !== expense.id)
                store.notify('Расход удалён')
              }
            ">
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
        :class="[style.formStack]">
        <Input
          v-model="form.title"
          label="Название"
          placeholder="Например, ужин в ресторане"
          required />
        <Select
          v-if="!tripId"
          v-model="form.tripId"
          label="Поездка"
          :options="
            store.trips
              .filter((t) => t.role === 'organizer' && !t.archived)
              .map((t) => ({ label: t.name, value: t.id }))
          "
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
        <div :class="[style.formActions]">
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
