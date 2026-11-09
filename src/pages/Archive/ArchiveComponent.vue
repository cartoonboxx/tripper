<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { PhArchive, PhArrowRight, PhMagnifyingGlass } from '@phosphor-icons/vue'
import { useTravelStore } from '@/stores/travel'
import { Input, EmptyState, Button } from '@/components/ui'
import TripCard from '@/components/trip/TripCard.vue'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'ArchiveComponent',
  components: { PhArrowRight, PhMagnifyingGlass, Input, EmptyState, Button, TripCard },
  data() {
    return {
      style: sharedStyle,
      search: '',
      PhArchive: markRawValue(PhArchive),
      PhArrowRight: markRawValue(PhArrowRight),
      PhMagnifyingGlass: markRawValue(PhMagnifyingGlass),
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    trips() {
      return this.store.trips.filter(
        (t) => t.archived && t.name.toLowerCase().includes(this.search.toLowerCase()),
      )
    },
  },
})
</script>
<template>
  <div>
    <header :class="[style.pageHeading]">
      <div>
        <span :class="[style.eyebrow]">У КАЖДОЙ ПОЕЗДКИ ЕСТЬ СВОЯ ИСТОРИЯ</span>
        <h1>Архив путешествий</h1>
        <p>Маршруты, впечатления и планы, к которым приятно возвращаться.</p>
      </div>
    </header>
    <div :class="[style.toolbar]">
      <span :class="[style.subtle]">{{ trips.length }} поездок в архиве</span>
      <Input
        v-model="search"
        placeholder="Найти в архиве…"
        title="Поиск в архиве"
        :class="[style.searchField]">
        <template #prefix>
          <PhMagnifyingGlass :size="16" />
        </template>
      </Input>
    </div>
    <div
      v-if="trips.length"
      :class="[style.tripGrid]">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip" />
    </div>
    <EmptyState
      v-else
      :icon="PhArchive"
      :title="search ? 'Поездок не найдено' : 'Ваши истории ещё впереди'"
      description="Завершённые поездки можно перенести сюда из меню карточки. Все планы и заметки сохранятся.">
      <AppLink to="/trips">
        <Button variant="secondary">
          К моим поездкам
          <PhArrowRight :size="16" />
        </Button>
      </AppLink>
    </EmptyState>
  </div>
</template>
