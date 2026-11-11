<template>
  <div>
    <SectionHeader
      header="Мои поездки"
      level="h1"
      paragraph="Все ваши путешествия и планы — в одном месте.">
      <template #actions>
        <Button @click="creating = true">
          <PhPlus :size="16" />
          Создать поездку
        </Button>
      </template>
    </SectionHeader>
    <div :class="sharedStyle.toolbar">
      <div :class="sharedStyle.filterTabs">
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
      </div>
      <Input
        v-model="search"
        placeholder="Поиск поездки"
        :class="sharedStyle.searchField"
        size="sm">
        <template #prefix>
          <PhMagnifyingGlass :size="16" />
        </template>
      </Input>
    </div>
    <div
      v-if="filtered.length"
      :class="sharedStyle.tripGrid">
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
    <section :class="style.inspirationBanner">
      <div :class="style.inspirationArt">
        <PhMapTrifold :size="30" />
      </div>
      <div>
        <h3>Куда отправимся в следующий раз?</h3>
        <p>Большое путешествие начинается с маленького плана.</p>
      </div>
      <span :class="style.bannerLine" />
      <Button
        variant="secondary"
        @click="creating = true">
        Запланировать поездку
        <PhArrowUpRight :size="16" />
      </Button>
    </section>
    <div
      v-if="isHome"
      :class="style.dashboardLower">
      <Card :class="style.dashboardPanel">
        <SectionHeader
          header="Ближайшее путешествие"
          level="h3">
          <template #actions>
            <PhCalendarDots
              :size="17"
              :class="sharedStyle.subtle" />
          </template>
        </SectionHeader>
        <template v-if="nextTrip">
          <p :class="sharedStyle.subtle">Самое время добавить последние штрихи к плану.</p>
          <AppLink
            :to="`/trips/${nextTrip.id}/today`"
            :class="style.miniEvent">
            <div :class="style.miniDate">
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
              :class="style.miniEventArrow" />
          </AppLink>
        </template>
        <p
          v-else
          :class="sharedStyle.subtle">
          Новые маршруты ещё впереди.
        </p>
      </Card>
      <Card :class="style.dashboardPanel">
        <SectionHeader
          header="Всё готово к поездке?"
          level="h3">
          <template #actions>
            <PhListChecks
              :size="17"
              :class="sharedStyle.subtle" />
          </template>
        </SectionHeader>
        <p :class="sharedStyle.subtle">Ничего не забыть и отправиться налегке.</p>
        <AppLink
          :to="nextTrip ? `/trips/${nextTrip.id}/checklists` : '/checklists'"
          :class="style.preparationRow">
          <span :class="sharedStyle.softIcon">
            <PhSuitcaseRolling :size="20" />
          </span>
          <div>
            <strong>{{ checklist?.title || 'Личный чек-лист' }}</strong>
            <p>{{ checked }} из {{ checklist?.items.length || 0 }} пунктов выполнено</p>
          </div>
          <span :class="style.prepPercent">{{ percentage }}%</span>
        </AppLink>
        <div :class="style.progressTrack"><span :style="{ width: percentage + '%' }" /></div>
      </Card>
    </div>
    <div :class="style.pageBottomNote">
      <PhLockKey :size="16" />
      Ваши планы доступны только вам и участникам поездки
    </div>
    <TripForm
      :open="creating"
      @close="creating = false" />
  </div>
</template>
<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripsPage.module.scss'
import { defineComponent, markRaw } from 'vue'
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

export default defineComponent({
  name: 'TripsPage',
  components: {
    SectionHeader,
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
      sharedStyle,
      style,
      search: '',
      filter: 'all',
      creating: false,
      PhSuitcaseRolling: markRaw(PhSuitcaseRolling),
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
    activeTrips() {
      return this.store.trips.filter((trip) => !trip.archived)
    },
    filtered() {
      const search = this.search.toLowerCase()
      return this.activeTrips.filter(
        (trip) =>
          (this.filter === 'all' || trip.status === this.filter) &&
          trip.name.toLowerCase().includes(search),
      )
    },
    nextTrip() {
      return [...this.activeTrips].sort((a, b) => a.start.localeCompare(b.start))[0]
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
