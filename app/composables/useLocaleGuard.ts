/**
 * Global route guard - Keep user's language mode consistent when browsing docs
 */
export const useLocaleGuard = () => {
  addRouteMiddleware('global-locale-guard', (to, from) => {
    // Check if this is a language switch (same page, different language)
    const fromPathWithoutLang = from.path.replace(/^\/cn/, '') || '/home/overview'
    const toPathWithoutLang = to.path.replace(/^\/cn/, '') || '/home/overview'
    const isLanguageSwitch = fromPathWithoutLang === toPathWithoutLang
    
    // Allow direct pass if switching language
    if (isLanguageSwitch) {
      return
    }

    // Keep language mode consistent based on source page
    const isFromChinese = from.path.includes('/cn')
    const isToChinese = to.path.includes('/cn')
    if (isFromChinese && !isToChinese) {
      return navigateTo('/cn' + to.path)
    }
    if (!isFromChinese && isToChinese) {
      return navigateTo(to.path.replace(/^\/cn/, '') || '/home/overview')
    }
  }, { global: true })
}
