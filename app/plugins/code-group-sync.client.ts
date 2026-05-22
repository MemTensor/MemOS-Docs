const CODE_GROUP_TABS = ['Python (HTTP)', 'Python (SDK)', 'Curl']

function normalizeTabLabel(text: string | null | undefined) {
  return (text || '').replace(/\s+/g, ' ').trim()
}

function getTabs(tablist: Element) {
  return Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'))
}

function isCodeGroupTablist(tablist: Element) {
  const labels = getTabs(tablist).map(tab => normalizeTabLabel(tab.textContent))
  return CODE_GROUP_TABS.every(label => labels.includes(label))
}

function findTab(tablist: Element, label: string) {
  return getTabs(tablist).find(tab => normalizeTabLabel(tab.textContent) === label)
}

function setCodeGroupTab(tablist: Element, label: string) {
  const tabs = getTabs(tablist)
  const activeTab = findTab(tablist, label)
  if (!activeTab) return

  tabs.forEach((tab) => {
    const isActive = tab === activeTab
    tab.setAttribute('aria-selected', String(isActive))
    tab.setAttribute('data-state', isActive ? 'active' : 'inactive')
    tab.setAttribute('tabindex', isActive ? '0' : '-1')

    if (isActive) {
      tab.setAttribute('data-active', '')
    } else {
      tab.removeAttribute('data-active')
    }
  })

  const root = tablist.parentElement
  if (!root) return

  tabs.forEach((tab) => {
    const panelId = tab.getAttribute('aria-controls')
    if (!panelId) return

    const isActive = tab === activeTab
    const panels = Array.from(root.querySelectorAll<HTMLElement>(`[aria-labelledby="${tab.id}"]`))
      .filter(panel => panel.getAttribute('role') === 'tabpanel')

    panels.forEach((panel) => {
      panel.setAttribute('data-state', isActive ? 'active' : 'inactive')
      panel.setAttribute('tabindex', isActive ? '0' : '-1')

      if (isActive) {
        panel.removeAttribute('hidden')
      } else {
        panel.setAttribute('hidden', '')
      }
    })
  })

  const indicator = tablist.querySelector<HTMLElement>('.absolute.left-0')
  if (indicator) {
    indicator.style.setProperty('--reka-tabs-indicator-size', `${activeTab.offsetWidth}px`)
    indicator.style.setProperty('--reka-tabs-indicator-position', `${activeTab.offsetLeft}px`)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  let activeCodeTab = ''

  function syncCodeGroups(label: string) {
    const tablists = Array.from(document.querySelectorAll('[role="tablist"]'))
      .filter(isCodeGroupTablist)

    if (!tablists.length) return

    tablists.forEach((tablist) => {
      const tab = findTab(tablist, label)
      if (!tab) return
      setCodeGroupTab(tablist, label)
    })
  }

  function scheduleSync(label: string) {
    requestAnimationFrame(() => syncCodeGroups(label))
  }

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>('[role="tab"]')
      : null

    if (!target) return

    const label = normalizeTabLabel(target.textContent)
    if (!CODE_GROUP_TABS.includes(label)) return

    const tablist = target.closest('[role="tablist"]')
    if (!tablist || !isCodeGroupTablist(tablist)) return

    activeCodeTab = label
    scheduleSync(label)
  })

  nuxtApp.hook('page:finish', () => {
    if (!activeCodeTab) return
    nextTick(() => scheduleSync(activeCodeTab))
  })

  nuxtApp.hook('app:suspense:resolve', () => {
    if (!activeCodeTab) return
    nextTick(() => scheduleSync(activeCodeTab))
  })
})
