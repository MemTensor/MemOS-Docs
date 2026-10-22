import { readFileSync } from 'node:fs'

export function validateConfig(input, now = new Date()) {
  const config = { ...input }
  const site = new URL(config.siteUrl)
  if (!['http:', 'https:'].includes(site.protocol) || site.pathname !== '/' || site.search || site.hash) {
    throw new Error('siteUrl 必须是 HTTP(S) 站点根地址，例如 https://docs.example.com/')
  }
  if (!Array.isArray(config.internalOrigins) || !Array.isArray(config.exampleHosts) || !Array.isArray(config.exceptions)) {
    throw new Error('internalOrigins、exampleHosts 和 exceptions 必须是数组')
  }
  config.internalOrigins = [...new Set([site.origin, ...config.internalOrigins.map((value) => {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash) {
      throw new Error(`站内域名配置无效：${value}`)
    }
    return url.origin
  })])]
  for (const name of ['timeoutMs', 'maxRedirects', 'concurrency', 'perOriginConcurrency', 'maxDurationMs', 'incompleteMinUrls']) {
    if (!Number.isInteger(config[name]) || config[name] < 1) throw new Error(`${name} 必须是正整数`)
  }
  for (const name of ['retries', 'retryDelayMs']) {
    if (!Number.isInteger(config[name]) || config[name] < 0) throw new Error(`${name} 必须是非负整数`)
  }
  if (typeof config.incompleteRatio !== 'number' || config.incompleteRatio < 0 || config.incompleteRatio > 1) {
    throw new Error('incompleteRatio 必须介于 0 和 1 之间')
  }
  if (config.exampleHosts.some(host => typeof host !== 'string' || !host || /[/*]/.test(host))) {
    throw new Error('exampleHosts 必须填写准确的主机名，不能使用通配符')
  }
  for (const exception of config.exceptions) {
    for (const field of ['url', 'reason', 'owner', 'expires']) {
      if (typeof exception[field] !== 'string' || !exception[field].trim()) throw new Error(`临时例外必须填写 ${field}`)
    }
    const url = new URL(exception.url)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`临时例外的 URL 无效：${exception.url}`)
    exception.url = url.href
    if (exception.source !== undefined && (typeof exception.source !== 'string' || !exception.source.startsWith('/'))) {
      throw new Error('临时例外的 source 必须是以 / 开头的准确发布路径')
    }
    const date = new Date(`${exception.expires}T23:59:59.999Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.expires) || !Number.isFinite(date.getTime())
      || date.toISOString().slice(0, 10) !== exception.expires || date < now) {
      throw new Error(`临时例外的到期日无效或已过期：${exception.url}（${exception.expires}）`)
    }
  }
  return config
}

export function loadConfig(file) {
  return validateConfig(JSON.parse(readFileSync(file, 'utf8')))
}
