export default defineNuxtPlugin((nuxtApp) => {
  const { trackEvent } = useArms()

  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement
    const link = target.closest('a')

    if (link) {
      const href = link.getAttribute('href')
      const text = link.innerText || link.textContent || ''

      trackEvent(text.trim(), '点击菜单', href ?? '')
    }
  }

  nuxtApp.vueApp.directive('track-nav', {
    mounted(el: HTMLElement) {
      el.addEventListener('click', handleClick)
    },
    beforeUnmount(el: HTMLElement) {
      el.removeEventListener('click', handleClick)
    }
  })
})
