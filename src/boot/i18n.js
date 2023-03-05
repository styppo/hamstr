import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

const [lng = 'en'] = (navigator?.language || '').split('-')

const i18n = createI18n({
  locale: lng,
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true
})

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

const $t = i18n.global.t

export { $t }
