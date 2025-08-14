export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.hook('app:mounted', () => {
      document.addEventListener('click', async (event) => {
        const link = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement
        if (!link) return
        
        const href = link.getAttribute('href')
        
        // Only handle internal links when in Chinese mode
        if (!href?.startsWith('/') || href.startsWith('/cn') || href.startsWith('http')) {
          return
        }
        
        if (window.location.pathname.startsWith('/cn')) {
          event.preventDefault()
          event.stopPropagation()
          
          try {
            await navigateTo('/cn' + href)
          } catch {
            window.location.href = '/cn' + href
          }
        }
      }, true)
    })
  }
})
