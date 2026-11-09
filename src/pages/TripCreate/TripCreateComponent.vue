<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import TripForm from '@/components/trip/TripForm.vue'
import { Button } from '@/components/ui'

export default defineComponent({
  name: 'TripCreateComponent',
  components: { TripForm, Button },
  data() {
    return { style: sharedStyle, open: true }
  },
  computed: {
    router() {
      return this.$router
    },
  },
})
</script>
<template>
  <div>
    <div :class="[style.pageHeading]">
      <div>
        <h1>Создать поездку</h1>
        <p>Новый маршрут, новые впечатления.</p>
      </div>
      <Button @click="open = true">Открыть форму</Button>
    </div>
    <TripForm
      :open="open"
      @close="
        () => {
          open = false
          router.push('/trips')
        }
      " />
  </div>
</template>
