import { createI18n } from 'vue-i18n'
import esMessages from '../locales/es/common.json'
import enMessages from '../locales/en/common.json'

const i18n = createI18n({
    legacy: false, // ← IMPORTANTE: usar Composition API
    locale: 'es',
    fallbackLocale: 'es',
    messages: {
        es: esMessages,
        en: enMessages
    }
})

export default i18n