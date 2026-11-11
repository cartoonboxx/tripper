<template>
  <AuthScreen register />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import AuthScreen from '@/components/auth/AuthScreen/AuthScreen.vue'

export default defineComponent({
  name: 'RegisterPage',
  components: { AuthScreen },
})
</script>
