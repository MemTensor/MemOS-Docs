export function useArms() {
  const trackEvent = (name: string, type: string, value?: string) => {
    const ArmsRum = window.RumSDK?.default
    if (import.meta.client && ArmsRum) {
      ArmsRum.sendCustom({
        type,
        name,
        value
      })
    }
  }

  return { trackEvent }
}
