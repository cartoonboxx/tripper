<template>
  <AuthScreen />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import AuthScreen from '@/components/auth/AuthScreen/AuthScreen.vue'

export default defineComponent({
  name: 'LoginPage',
  components: { AuthScreen },
})
</script>
