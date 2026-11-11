<template>
  <div>
    <SectionHeader
      header="Архив путешествий"
      level="h1"
      paragraph="Маршруты, впечатления и планы, к которым приятно возвращаться." />
    <div :class="style.toolbar">
      <span :class="style.subtle">{{ trips.length }} поездок в архиве</span>
      <Input
        v-model="search"
        placeholder="Найти в архиве…"
        :class="style.searchField"
        size="sm">
        <template #prefix>
          <PhMagnifyingGlass :size="16" />
        </template>
      </Input>
    </div>
    <div
      v-if="trips.length"
      :class="style.tripGrid">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip" />
    </div>
    <EmptyState
      v-else
      :icon="PhArchive"
      :title="search ? 'Поездок не найдено' : 'Ваши истории ещё впереди'"
      description="Перенесите поездку в архив через меню карточки. Планы, места и заметки сохранятся.">
      <AppLink to="/trips">
        <Button variant="secondary">
          К моим поездкам
          <PhArrowRight :size="16" />
        </Button>
      </AppLink>
    </EmptyState>
  </div>
</template>
<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent, markRaw } from 'vue'
import { PhArchive, PhArrowRight, PhMagnifyingGlass } from '@phosphor-icons/vue'
import { useTravelStore } from '@/stores/travel'
import { Input, EmptyState, Button } from '@/components/ui'
import TripCard from '@/components/trip/TripCard.vue'

export default defineComponent({
  name: 'ArchivePage',
  components: {
    SectionHeader,
    PhArrowRight,
    PhMagnifyingGlass,
    Input,
    EmptyState,
    Button,
    TripCard,
  },
  data() {
    return {
      style: sharedStyle,
      search: '',
      PhArchive: markRaw(PhArchive),
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
