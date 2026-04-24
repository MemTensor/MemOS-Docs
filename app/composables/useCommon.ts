export function useHomeUrl(basePath: string = '/', locale: string = 'cn') {
  const { $config } = useNuxtApp()
  const baseUrl = $config.public.homeDomain || 'https://memos.openmem.net'
  const prefix = locale === 'cn' ? '/cn' : ''

  return `${baseUrl}${prefix}${basePath}`
}

export function useDashboardUrl(basePath: string = '/', locale: string = 'cn') {
  const { $config } = useNuxtApp()
  const baseUrl = $config.public.dashboardUrl || 'https://memos-dashboard.openmem.net'
  const prefix = locale === 'cn' ? '/cn' : ''

  return `${baseUrl}${prefix}${basePath}`
}

export function usePlaygroundUrl(basePath: string = '/', locale: string = 'cn') {
  const { $config } = useNuxtApp()
  const baseUrl = $config.public.playgroundUrl || 'https://memos-playground.openmem.net'
  const prefix = locale === 'cn' ? '/cn' : ''

  return `${baseUrl}${prefix}${basePath}`
}

export function useLangPath(basePath: string = '/', locale: string = 'cn') {
  const prefix = locale === 'cn' ? '/cn' : ''

  return `${prefix}${basePath}`
}

export function useGithubUrl() {
  const { $config } = useNuxtApp()

  return $config.public.githubMemosUrl || 'https://github.com/MemTensor/MemOS'
}

export function useOpenMemUrl() {
  const { $config } = useNuxtApp()

  return $config.public.openMemUrl || 'https://openmem.net/'
}
