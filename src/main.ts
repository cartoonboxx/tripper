import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import AppLink from '@/components/navigation/AppLink.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('AppLink', AppLink)

app.mount('#app')
document.querySelector('#app')?.removeAttribute('data-v-app')

import './styles/main.scss'
