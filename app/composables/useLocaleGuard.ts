/**
 * 全局路由守卫 - 保持用户在文档浏览时的语言模式一致性
 */
export const useLocaleGuard = () => {
  addRouteMiddleware('global-locale-guard', (to, from) => {
    console.log('Route guard: from', from.path, 'to', to.path)
    
    // 检查是否是语言切换操作（同一页面在不同语言之间切换）
    const fromPathWithoutLang = from.path.replace(/^\/cn/, '') || '/home/overview'
    const toPathWithoutLang = to.path.replace(/^\/cn/, '') || '/home/overview'
    const isLanguageSwitch = fromPathWithoutLang === toPathWithoutLang
    
    // 如果是语言切换操作，直接允许通过，不拦截
    if (isLanguageSwitch) {
      console.log('语言切换操作，允许通过:', from.path, '->', to.path)
      return
    }
    
    // 检查来源和目标路径的语言模式
    const isFromChinese = from.path && from.path.startsWith('/cn')
    const isFromEnglish = from.path && !from.path.startsWith('/cn') && from.path !== '/'
    const isToChinese = to.path.startsWith('/cn')
    const isToEnglish = !to.path.startsWith('/cn') && to.path !== '/'
    
    // 情况1: 在中文模式下点击文档链接，但链接没有 /cn 前缀 -> 保持中文模式
    if (isFromChinese && isToEnglish) {
      const correctedPath = '/cn' + to.path
      console.log('保持中文模式:', to.path, '->', correctedPath)
      return navigateTo(correctedPath)
    }
    
    // 情况2: 在英文模式下点击文档链接，但链接有 /cn 前缀 -> 保持英文模式  
    if (isFromEnglish && isToChinese) {
      const correctedPath = to.path.replace('/cn', '') || '/home/overview'
      console.log('保持英文模式:', to.path, '->', correctedPath)
      return navigateTo(correctedPath)
    }
  }, { global: true })
}
