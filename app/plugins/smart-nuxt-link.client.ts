export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.hook('app:mounted', () => {
      console.log('🔗 Smart link interceptor started')
      
      // Listen for clicks and intercept navigation directly
      document.addEventListener('click', async (event) => {
        const target = event.target as HTMLElement
        const link = target.closest('a[href]') as HTMLAnchorElement
        
        if (!link) return
        
        const href = link.getAttribute('href')
        
        // Only handle internal links when currently in Chinese mode
        if (!href || !href.startsWith('/') || href.startsWith('/cn') || href.startsWith('http')) {
          return
        }
        
        const currentPath = window.location.pathname
        const isCurrentlyInCnMode = currentPath.startsWith('/cn')
        
        if (isCurrentlyInCnMode) {
          console.log('🔗 Intercepting navigation:', href, 'current mode: Chinese')
          
          // Completely prevent default navigation
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          
          const newPath = '/cn' + href
          console.log('🔗 Manual navigation to:', newPath)
          
          try {
            // Use navigateTo for SPA navigation
            await navigateTo(newPath)
            console.log('🔗 navigateTo completed')
          } catch (error) {
            console.warn('🔗 Navigation failed, fallback to window.location:', error)
            window.location.href = newPath
          }
          return false
        }
      }, true) // Use capture phase for priority interception
    })
  }
})
