<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { defineComponent } from 'vue'
import TripForm from '@/components/trip/TripForm.vue'
import { Button } from '@/components/ui'

export default defineComponent({
  name: 'TripCreateComponent',
  components: { SectionHeader, TripForm, Button },
  data() {
    return { open: true }
  },
  methods: {
    close() {
      this.open = false
      this.$router.push('/trips')
    },
  },
})
</script>
<template>
  <div>
    <SectionHeader
      header="Создать поездку"
      level="h1"
      paragraph="Новый маршрут, новые впечатления.">
      <template #actions>
        <Button @click="open = true">Открыть форму</Button>
      </template>
    </SectionHeader>
    <TripForm
      :open="open"
      @close="close" />
  </div>
</template>
