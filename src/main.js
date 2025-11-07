import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './config/i18n'

// Importar Vercel Analytics para Vue
import { inject } from '@vercel/analytics'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Inicializar Analytics
inject()  // ← AQUÍ SE AGREGA

app.mount('#app')