/**
 * 全局路由守卫 - 保持用户在文档浏览时的语言模式一致性
 */
export const useLocaleGuard = () => {
  addRouteMiddleware('global-locale-guard', (to, from) => {
    // console.log('Route guard: from', from.path, 'to', to.path)
    
    // 检查是否是语言切换操作（同一页面在不同语言之间切换）
    const fromPathWithoutLang = from.path.replace(/^\/cn/, '') || '/home/overview'
    const toPathWithoutLang = to.path.replace(/^\/cn/, '') || '/home/overview'
    const isLanguageSwitch = fromPathWithoutLang === toPathWithoutLang
    
    // 如果是语言切换操作，直接允许通过，不拦截
    if (isLanguageSwitch) {
      return
    }

    // 根据来源页面语言模式保持一致性
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
