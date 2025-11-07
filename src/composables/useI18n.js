import { useI18n } from 'vue-i18n'

export function useI18nComposable() {  // ← Exporta useI18nComposable
  const { t, locale } = useI18n()

  const changeLanguage = (lng) => {
    locale.value = lng
    localStorage.setItem('preferred-language', lng)
  }

  const currentLanguage = () => {
    return locale.value
  }

  const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage
    return browserLang.startsWith('es') ? 'es' : 'en'
  }

  const initLanguage = () => {
    const savedLang = localStorage.getItem('preferred-language')
    const browserLang = detectBrowserLanguage()
    const lang = savedLang || browserLang || 'es'

    locale.value = lang
    return lang
  }

  return {
    t,
    changeLanguage,
    currentLanguage,
    initLanguage,
    locale
  }
}