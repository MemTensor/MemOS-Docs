<script setup lang="ts">
const router = useRouter()
const nuxtApp = useNuxtApp()

function getHistoryPosition() {
  const { position } = router.options.history.state
  return typeof position === 'number' ? position : undefined
}

if (import.meta.client) {
  const scrollPositions = new Map<number, number>()
  let activePosition = getHistoryPosition()
  let historyNavigation: { fullPath: string, position: number | undefined } | undefined
  let pendingScroll: { fullPath: string, hash: string, top: number | undefined } | undefined

  function scrollPanel() {
    const scroll = pendingScroll
    const panel = document.getElementById('dashboard-panel-main')
    if (!scroll || scroll.fullPath !== router.currentRoute.value.fullPath || !panel) return

    pendingScroll = undefined
    if (scroll.top !== undefined) {
      panel.scrollTop = scroll.top
    } else if (scroll.hash) {
      document.getElementById(scroll.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      panel.scrollTop = 0
    }
  }

  // Vue Router's history listener runs for browser back and forward.
  const stopHistoryListener = router.options.history.listen((to) => {
    historyNavigation = { fullPath: router.resolve(to).fullPath, position: getHistoryPosition() }
  })

  const stopBeforeEach = router.beforeEach(() => {
    const panel = document.getElementById('dashboard-panel-main')
    // The browser may already point to the destination entry during a traversal.
    if (panel && activePosition !== undefined && !pendingScroll) {
      scrollPositions.set(activePosition, panel.scrollTop)
    }
  })

  const stopAfterEach = router.afterEach((to, from, failure) => {
    const position = getHistoryPosition()
    const isHistoryNavigation = historyNavigation?.fullPath === to.fullPath
      && historyNavigation.position === position

    if (isHistoryNavigation || !failure) historyNavigation = undefined
    if (failure) return

    activePosition = position
    const top = isHistoryNavigation && position !== undefined ? scrollPositions.get(position) : undefined
    // A new visit can reuse an index when it replaces the forward history.
    if (!isHistoryNavigation && position !== undefined) scrollPositions.delete(position)

    const samePage = to.path.replace(/\/$/, '') === from.path.replace(/\/$/, '')
    if (samePage && to.hash === from.hash && top === undefined) {
      if (pendingScroll?.fullPath === from.fullPath) pendingScroll.fullPath = to.fullPath
      return
    }

    pendingScroll = { fullPath: to.fullPath, hash: to.hash, top }
    // Navigating within a page does not require a new page render.
    if (samePage) void nextTick(scrollPanel)
  })

  const stopPageFinish = nuxtApp.hook('page:finish', () => nextTick(scrollPanel))

  onMounted(() => {
    const { fullPath, hash } = router.currentRoute.value
    if (hash) {
      pendingScroll = { fullPath, hash, top: undefined }
      void nextTick(scrollPanel)
    }
  })

  onScopeDispose(() => {
    stopHistoryListener()
    stopBeforeEach()
    stopAfterEach()
    stopPageFinish()
  })
}
</script>

<template>
  <UDashboardGroup
    :persistent="false"
    unit="px"
    class="h-screen overflow-hidden"
  >
    <UDashboardPanel
      id="main"
      class="h-full overflow-y-auto scrollbar-hide "
    >
      <slot />
    </UDashboardPanel>
    <LazyAssistant />
  </UDashboardGroup>
</template>
