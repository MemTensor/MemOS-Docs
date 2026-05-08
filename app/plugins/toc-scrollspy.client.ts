/**
 * Fix UContentToc highlight in nested scroll containers.
 *
 * @nuxt/ui-pro's useScrollspy creates an IntersectionObserver with root=null
 * (viewport), but the actual scroll container in this project is
 * #dashboard-panel-main (inside a fixed UDashboardGroup). The viewport-based
 * observer never fires meaningful changes, so the TOC indicator stays hidden.
 *
 * This plugin creates its own IntersectionObserver rooted at the panel element
 * and directly patches the indicator's CSS custom properties and link active
 * classes that UContentToc renders.
 */

const LINK_HEIGHT = 28

export default defineNuxtPlugin((nuxtApp) => {
  let cleanup: (() => void) | null = null

  function setup() {
    if (cleanup) {
      cleanup()
      cleanup = null
    }

    nextTick(() => {
      const panel = document.getElementById('dashboard-panel-main')
      if (!panel) return

      const grid = panel.querySelector('.doc-page-grid')
      if (!grid) return

      // UContentToc renders as a <nav> inside the grid's right column
      const tocNav = grid.querySelector<HTMLElement>(':scope > nav')
      if (!tocNav) return

      const tocLinks = tocNav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
      if (!tocLinks.length) return

      // The indicator is the absolutely-positioned 1px-wide bar
      const indicator = tocNav.querySelector<HTMLElement>('div.absolute.w-px')

      const linkIds: string[] = []
      const linkMap = new Map<string, HTMLAnchorElement[]>()
      tocLinks.forEach((a) => {
        const id = decodeURIComponent(a.getAttribute('href')?.slice(1) || '')
        if (!id) return
        if (!linkMap.has(id)) {
          linkIds.push(id)
          linkMap.set(id, [])
        }
        linkMap.get(id)!.push(a)
      })

      const visibleIds = new Set<string>()
      let lastActiveIds: string[] = []

      function applyHighlight(activeIds: string[]) {
        linkMap.forEach((anchors, id) => {
          const isActive = activeIds.includes(id)
          anchors.forEach((a) => {
            if (isActive) {
              a.classList.remove('text-muted')
              a.classList.add('text-primary')
            } else {
              a.classList.remove('text-primary')
              if (!a.classList.contains('text-muted')) {
                a.classList.add('text-muted')
              }
            }
          })
        })

        if (!indicator) return
        if (!activeIds.length) return

        const firstIdx = linkIds.indexOf(activeIds[0])
        if (firstIdx < 0) return

        indicator.style.setProperty(
          '--indicator-size',
          `${LINK_HEIGHT * activeIds.length}px`
        )
        indicator.style.setProperty(
          '--indicator-position',
          `${firstIdx * LINK_HEIGHT}px`
        )
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const id = entry.target.id
            if (!id) return
            if (entry.isIntersecting) {
              visibleIds.add(id)
            } else {
              visibleIds.delete(id)
            }
          })
          const active = linkIds.filter((id) => visibleIds.has(id))
          if (active.length) lastActiveIds = active
          applyHighlight(lastActiveIds)
        },
        { root: panel, threshold: 0 }
      )

      const headings = panel.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]')
      headings.forEach((h) => observer.observe(h))

      // Give the observer a moment to deliver initial entries
      requestAnimationFrame(() => {
        const active = linkIds.filter((id) => visibleIds.has(id))
        if (active.length) lastActiveIds = active
        applyHighlight(lastActiveIds)
      })

      cleanup = () => observer.disconnect()
    })
  }

  nuxtApp.hook('page:finish', () => setup())
  nuxtApp.hook('app:suspense:resolve', () => {
    requestAnimationFrame(() => setup())
  })
})
