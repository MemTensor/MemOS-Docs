export default defineNuxtPlugin(() => {
  const storageKey = 'memos-docs-color-mode'
  const colorMode = useColorMode()

  try {
    const legacyPreference = window.localStorage.getItem(storageKey)
    if (!legacyPreference) {
      return
    }

    const normalizedPreference = ['light', 'dark', 'system'].includes(legacyPreference)
      ? legacyPreference
      : 'light'

    document.cookie = `${storageKey}=${normalizedPreference}; Path=/; Max-Age=31536000; SameSite=Lax`
    window.localStorage.removeItem(storageKey)

    colorMode.preference = normalizedPreference as 'light' | 'dark' | 'system'

    const prefersDark = normalizedPreference === 'dark'
      || (normalizedPreference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', prefersDark)
  } catch {
    // Ignore storage access failures in restricted browser environments.
  }
})
