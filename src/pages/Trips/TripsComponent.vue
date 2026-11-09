<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripsComponent.module.scss'
import { defineComponent } from 'vue'
import {
  PhArrowRight,
  PhArrowUpRight,
  PhCalendarDots,
  PhListChecks,
  PhLockKey,
  PhMagnifyingGlass,
  PhMapTrifold,
  PhPlus,
  PhSuitcaseRolling,
} from '@phosphor-icons/vue'
import { Button, Input, Tab, EmptyState, Card } from '@/components/ui'
import TripCard from '@/components/trip/TripCard.vue'
import TripForm from '@/components/trip/TripForm.vue'
import { useTravelStore } from '@/stores/travel'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'TripsComponent',
  components: {
    PhArrowRight,
    PhArrowUpRight,
    PhCalendarDots,
    PhListChecks,
    PhLockKey,
    PhMagnifyingGlass,
    PhMapTrifold,
    PhPlus,
    PhSuitcaseRolling,
    Button,
    Input,
    Tab,
    EmptyState,
    Card,
    TripCard,
    TripForm,
  },
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      search: '',
      filter: 'all',
      creating: false,
      PhArrowRight: markRawValue(PhArrowRight),
      PhArrowUpRight: markRawValue(PhArrowUpRight),
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhListChecks: markRawValue(PhListChecks),
      PhLockKey: markRawValue(PhLockKey),
      PhMagnifyingGlass: markRawValue(PhMagnifyingGlass),
      PhMapTrifold: markRawValue(PhMapTrifold),
      PhPlus: markRawValue(PhPlus),
      PhSuitcaseRolling: markRawValue(PhSuitcaseRolling),
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    route() {
      return this.$route
    },
    isHome() {
      return this.route.name === 'home'
    },
    filtered() {
      return this.store.trips.filter(
        (t) =>
          !t.archived &&
          (this.filter === 'all' || t.status === this.filter) &&
          t.name.toLowerCase().includes(this.search.toLowerCase()),
      )
    },
    nextTrip() {
      return this.store.trips
        .filter((t) => !t.archived && t.status !== 'completed')
        .sort((a, b) => a.start.localeCompare(b.start))[0]
    },
    checklist() {
      return this.store.checklists.find((c) => c.tripId === this.nextTrip?.id)
    },
    checked() {
      return this.checklist?.items.filter((i) => i.checked).length || 0
    },
    percentage() {
      return Math.round((this.checked / (this.checklist?.items.length || 1)) * 100)
    },
  },
})
</script>
<template>
  <div>
    <header :class="[style.pageHeading]">
      <div>
        <span :class="[style.eyebrow]">СОБИРАЙТЕ МОМЕНТЫ, А НЕ ВКЛАДКИ</span>
        <h1>
          Мои поездки
          <span :class="[style.titleCount]">
            {{ store.trips.filter((t) => !t.archived).length }}
          </span>
        </h1>
        <p>Все ваши путешествия и планы — в одном месте.</p>
      </div>
      <Button @click="creating = true">
        <PhPlus :size="16" />
        Создать поездку
      </Button>
    </header>
    <div :class="[style.toolbar]">
      <div
        title="Фильтр поездок"
        :class="[style.filterTabs]">
        <Tab
          :active="filter === 'all'"
          @click="filter = 'all'">
          Все поездки
        </Tab>
        <Tab
          :active="filter === 'active'"
          @click="filter = 'active'">
          Активные
        </Tab>
        <Tab
          :active="filter === 'upcoming'"
          @click="filter = 'upcoming'">
          Предстоящие
        </Tab>
        <Tab
          :active="filter === 'completed'"
          @click="filter = 'completed'">
          Завершённые
        </Tab>
      </div>
      <Input
        v-model="search"
        placeholder="Найти поездку…"
        title="Поиск поездок"
        :class="[style.searchField]">
        <template #prefix>
          <PhMagnifyingGlass :size="16" />
        </template>
      </Input>
    </div>
    <div
      v-if="filtered.length"
      :class="[style.tripGrid]">
      <TripCard
        v-for="trip in filtered"
        :key="trip.id"
        :trip="trip" />
    </div>
    <EmptyState
      v-else
      :icon="PhSuitcaseRolling"
      :title="search ? 'Ничего не нашлось' : 'Здесь начнётся ваше путешествие'"
      :description="
        search
          ? 'Попробуйте изменить запрос или выбрать другой фильтр.'
          : 'Создайте поездку, чтобы собрать планы, места и впечатления вместе.'
      ">
      <Button
        v-if="!search"
        @click="creating = true">
        <PhPlus :size="16" />
        Создать поездку
      </Button>
    </EmptyState>
    <section :class="[style.inspirationBanner]">
      <div :class="[style.inspirationArt]">
        <PhMapTrifold :size="30" />
      </div>
      <div>
        <h3>Куда отправимся в следующий раз?</h3>
        <p>Большое путешествие начинается с маленького плана.</p>
      </div>
      <span :class="[style.bannerLine]" />
      <Button
        variant="secondary"
        @click="creating = true">
        Запланировать поездку
        <PhArrowUpRight :size="16" />
      </Button>
    </section>
    <div
      v-if="isHome"
      :class="[style.dashboardLower]">
      <Card :class="[style.dashboardPanel]">
        <div :class="[style.sectionHeading]">
          <h3>Ближайшее путешествие</h3>
          <PhCalendarDots
            :size="17"
            :class="[style.subtle]" />
        </div>
        <template v-if="nextTrip">
          <p :class="[style.subtle]">Самое время добавить последние штрихи к плану.</p>
          <AppLink
            :to="`/trips/${nextTrip.id}/plan`"
            :class="[style.miniEvent]">
            <div :class="[style.miniDate]">
              <strong>{{ new Date(nextTrip.start).getDate() }}</strong>
              <span>
                {{
                  new Date(nextTrip.start)
                    .toLocaleDateString('ru-RU', { month: 'short' })
                    .toUpperCase()
                }}
              </span>
            </div>
            <div>
              <strong>{{ nextTrip.name }} ждёт вас</strong>
              <p>{{ nextTrip.country }} · Всё для вашей поездки</p>
            </div>
            <PhArrowRight
              :size="18"
              :class="[style.miniEventArrow]" />
          </AppLink>
        </template>
        <p
          v-else
          :class="[style.subtle]">
          Новые маршруты ещё впереди.
        </p>
      </Card>
      <Card :class="[style.dashboardPanel]">
        <div :class="[style.sectionHeading]">
          <h3>Всё готово к поездке?</h3>
          <PhListChecks
            :size="17"
            :class="[style.subtle]" />
        </div>
        <p :class="[style.subtle]">Ничего не забыть и отправиться налегке.</p>
        <AppLink
          :to="nextTrip ? `/trips/${nextTrip.id}/checklists` : '/checklists'"
          :class="[style.preparationRow]">
          <span :class="[style.softIcon]">
            <PhSuitcaseRolling :size="20" />
          </span>
          <div>
            <strong>{{ checklist?.title || 'Личный чек-лист' }}</strong>
            <p>{{ checked }} из {{ checklist?.items.length || 0 }} пунктов выполнено</p>
          </div>
          <span :class="[style.prepPercent]">{{ percentage }}%</span>
        </AppLink>
        <div :class="[style.progressTrack]"><span :style="{ width: percentage + '%' }" /></div>
      </Card>
    </div>
    <div :class="[style.pageBottomNote]">
      <PhLockKey :size="16" />
      Ваши планы доступны только вам и участникам поездки
    </div>
    <TripForm
      :open="creating"
      @close="creating = false" />
  </div>
</template>
