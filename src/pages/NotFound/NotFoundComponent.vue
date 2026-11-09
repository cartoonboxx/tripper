<script lang="ts">
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { PhArrowLeft, PhCompass } from '@phosphor-icons/vue'
import { EmptyState, Button } from '@/components/ui'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'NotFoundComponent',
  components: { PhArrowLeft, EmptyState, Button },
  data() {
    return {
      style: sharedStyle,
      PhArrowLeft: markRawValue(PhArrowLeft),
      PhCompass: markRawValue(PhCompass),
    }
  },
})
</script>
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
