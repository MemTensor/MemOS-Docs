/**
 * First-touch 获客归因采集（与 Platform utils/attribution.ts 同一套逻辑）。
 *
 * 用户第一次落到 *.openmem.net 任意页面时，把当时的 utm / referrer / landing_page
 * 写进根域 cookie（memos_attr），90 天有效、只写一次不覆盖。
 * 后续用户在控制台注册时，Platform 会把该 cookie 随登录请求带给后端落库，
 * 打通「渠道 → 注册 → 激活/流失」漏斗分析。
 */

const ATTR_COOKIE = 'memos_attr'
const COOKIE_MAX_AGE = 90 * 24 * 3600
const ROOT_DOMAIN = 'openmem.net'

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

function captureFirstTouchAttribution(): void {
  try {
    if (getCookie(ATTR_COOKIE))
      return

    const query = new URLSearchParams(location.search)
    let source = query.get('utm_source') || ''
    let medium = query.get('utm_medium') || ''
    const campaign = query.get('utm_campaign') || ''

    let refHost = ''
    try {
      refHost = document.referrer ? new URL(document.referrer).hostname : ''
    }
    catch { /* referrer 非法时按 direct 处理 */ }

    const isInternalRef = !refHost
      || refHost === location.hostname
      || refHost === ROOT_DOMAIN
      || refHost.endsWith(`.${ROOT_DOMAIN}`)

    if (!source) {
      if (!isInternalRef) {
        source = refHost
        medium = medium || 'referral'
      }
      else {
        source = '(direct)'
        medium = medium || '(none)'
      }
    }

    const value = {
      source,
      medium: medium || '(not set)',
      campaign,
      referrer: (document.referrer || '').slice(0, 300),
      landing_page: (location.origin + location.pathname).slice(0, 300),
      ts: Date.now(),
    }

    const encoded = encodeURIComponent(JSON.stringify(value))
    const domain = location.hostname.endsWith(ROOT_DOMAIN) ? `;domain=.${ROOT_DOMAIN}` : ''
    document.cookie = `${ATTR_COOKIE}=${encoded};path=/;max-age=${COOKIE_MAX_AGE}${domain};SameSite=Lax`
  }
  catch { /* 归因采集失败不影响业务 */ }
}

export default defineNuxtPlugin(() => {
  captureFirstTouchAttribution()
})
