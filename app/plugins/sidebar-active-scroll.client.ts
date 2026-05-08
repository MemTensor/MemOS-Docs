/**
 * Keep the left docs navigation aligned with the active page.
 *
 * UContentNavigation updates the active link after route changes, but the
 * sidebar scroll position is preserved. When navigating to a page far below the
 * current viewport, the active item can be highlighted off-screen.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  let frame: number | null = null
  let timeout: number | null = null

  function normalizePath(path: string) {
    return path.replace(/\/$/, '') || '/'
  }

  function getScrollableContainer(active: HTMLElement, sidebar: HTMLElement) {
    let node: HTMLElement | null = active

    while (node && node !== sidebar.parentElement) {
      const style = window.getComputedStyle(node)
      const canScroll = /(auto|scroll)/.test(style.overflowY)
        && node.scrollHeight > node.clientHeight

      if (canScroll) return node
      if (node === sidebar) break
      node = node.parentElement
    }

    return sidebar
  }

  function findActiveLink(sidebar: HTMLElement) {
    const currentPath = normalizePath(route.path)
    const links = Array.from(sidebar.querySelectorAll<HTMLAnchorElement>('a[href]'))

    return links.find((link) => {
      const href = link.getAttribute('href')
      if (!href || href.startsWith('#')) return false

      const url = new URL(href, window.location.origin)
      return normalizePath(url.pathname) === currentPath
    }) || sidebar.querySelector<HTMLElement>('a.text-primary[href], a[aria-current="page"]')
  }

  function scrollActiveLinkIntoView() {
    const sidebars = document.querySelectorAll<HTMLElement>('.doc-sidebar-nav')
    if (!sidebars.length) return

    sidebars.forEach((sidebar) => {
      const active = findActiveLink(sidebar)
      if (!active) return

      const scrollContainer = getScrollableContainer(active, sidebar)
      const containerRect = scrollContainer.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()

      const isVisible = activeRect.top >= containerRect.top
        && activeRect.bottom <= containerRect.bottom

      if (isVisible) return

      const targetTop = scrollContainer.scrollTop
        + activeRect.top
        - containerRect.top
        - (scrollContainer.clientHeight / 2)
        + (activeRect.height / 2)

      scrollContainer.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth'
      })
    })
  }

  function scheduleScroll() {
    if (frame !== null) cancelAnimationFrame(frame)
    if (timeout !== null) window.clearTimeout(timeout)

    frame = requestAnimationFrame(() => {
      frame = null
      nextTick(() => {
        scrollActiveLinkIntoView()
        // UContentNavigation may update active/open state one tick later.
        timeout = window.setTimeout(scrollActiveLinkIntoView, 120)
      })
    })
  }

  watch(() => route.path, () => scheduleScroll(), { flush: 'post' })
  nuxtApp.hook('page:finish', () => scheduleScroll())
  nuxtApp.hook('app:suspense:resolve', () => scheduleScroll())
})
