<template>
  <EmptyState
    :icon="PhCompass"
    title="Кажется, мы сбились с маршрута"
    description="Этой страницы нет. Вернёмся туда, где начинаются путешествия?">
    <AppLink to="/">
      <Button>
        <PhArrowLeft :size="16" />
        На главную
      </Button>
    </AppLink>
  </EmptyState>
</template>
<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { PhArrowLeft, PhCompass } from '@phosphor-icons/vue'
import { EmptyState, Button } from '@/components/ui'

export default defineComponent({
  name: 'NotFoundPage',
  components: { PhArrowLeft, EmptyState, Button },
  data() {
    return {
      PhCompass: markRaw(PhCompass),
    }
  },
})
</script>
