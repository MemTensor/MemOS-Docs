export const useVariableReplacement = () => {
  const config = useRuntimeConfig()

  const replaceVariables = (text: string) => {
    if (!text) return text

    let newText = text

    const domains: Record<string, string> = {
      'https://cdn.memtensor.com.cn': config.public.cdnUrl as string,
      'https://statics.memtensor.com.cn': config.public.staticCdnUrl as string,
      'https://memos-playground.openmem.net': config.public.playgroundUrl as string,
      'https://memos-dashboard.openmem.net': config.public.dashboardUrl as string,
      'https://memos.openmem.net': config.public.homeDomain as string,
      'https://memos.memtensor.cn/api': config.public.baseUrl as string
    }

    Object.keys(domains).forEach((key) => {
      if (domains[key]) {
        newText = newText.split(key).join(domains[key])
      }
    })

    return newText
  }

  return {
    replaceVariables
  }
}
