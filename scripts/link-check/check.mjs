import { checkExternalLinks, isExampleHost } from './network.mjs'

const skipProtocols = new Set(['mailto:', 'tel:', 'sms:', 'data:', 'blob:', 'javascript:'])

export function resolveInternal(url, artifacts, config, visited = new Set()) {
  if (!config.internalOrigins.includes(url.origin)) return { status: 'external', target: url.href }
  if (visited.has(url.href)) return { status: 'error', code: 'REDIRECT_LOOP', message: 'Internal redirect loop' }
  if (visited.size > config.maxRedirects) return { status: 'error', code: 'TOO_MANY_REDIRECTS', message: 'Too many internal redirects' }
  visited.add(url.href)
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    return { status: 'error', code: 'INVALID_URL', message: 'Malformed URL encoding' }
  }
  const file = artifacts.routes.get(pathname)
  if (!file) return { status: 'error', code: 'MISSING_FILE', message: `No build artifact for ${pathname}` }
  const doc = artifacts.byFile.get(file)
  if (doc?.redirect !== undefined) {
    try {
      const target = new URL(doc.redirect, doc.baseUrl)
      if (!doc.redirect.includes('#')) target.hash = url.hash
      if (!['http:', 'https:'].includes(target.protocol)) {
        return { status: 'warning', code: 'UNSUPPORTED_REDIRECT', message: 'Internal page redirects to an unsupported protocol' }
      }
      return resolveInternal(target, artifacts, config, visited)
    } catch {
      return { status: 'error', code: 'INVALID_REDIRECT', message: 'Invalid HTML refresh target' }
    }
  }
  if (url.hash && url.hash !== '#') {
    let fragment
    try {
      fragment = decodeURIComponent(url.hash.slice(1))
    } catch {
      return { status: 'error', code: 'INVALID_URL', message: 'Malformed fragment encoding' }
    }
    const anchor = fragment.split(':~:')[0]
    if (!anchor) return { status: 'warning', code: 'TEXT_FRAGMENT_UNVERIFIED', message: 'Text fragments require browser verification', file }
    if (doc?.kind !== 'html') return { status: 'warning', code: 'NON_HTML_FRAGMENT', message: 'Fragments in Markdown, text and binary resources depend on the reader', file }
    if (anchor.toLowerCase() !== 'top' && !doc.ids.has(anchor)) {
      return { status: 'error', code: 'MISSING_ANCHOR', message: `Anchor #${anchor} does not exist in ${file}`, file }
    }
  }
  return { status: 'ok', code: 'INTERNAL_OK', file }
}

export async function checkLinks(artifacts, config, options = {}) {
  const groups = new Map()
  let references = 0
  let externalFragmentsUnchecked = 0
  function add(key, target, result, reference) {
    if (!groups.has(key)) groups.set(key, { target, ...result, references: [] })
    groups.get(key).references.push(reference)
  }
  for (const doc of artifacts.documents) {
    for (const link of doc.links) {
      references++
      const reference = { file: doc.file, pageUrl: doc.pageUrl, line: link.line, column: link.column,
        url: link.url, attribute: link.attribute, context: link.context }
      let url
      try {
        url = new URL(link.url, doc.baseUrl)
      } catch {
        add(`invalid:${link.url}`, link.url, { status: 'error', code: 'INVALID_URL', message: 'Cannot resolve URL' }, reference)
        continue
      }
      reference.resolvedUrl = url.href
      const exception = config.exceptions.find(item => item.url === url.href && (!item.source || item.source === doc.pathname))
      if (exception) {
        add(`exception:${url.href}:${exception.source || '*'}`, url.href, { status: 'skipped', code: 'EXCEPTION',
          message: exception.reason, owner: exception.owner, expires: exception.expires }, reference)
        continue
      }
      if (skipProtocols.has(url.protocol)) {
        add(`skip:${url.href}`, url.href, { status: 'skipped', code: 'NON_HTTP', message: `${url.protocol} is not an HTTP resource` }, reference)
        continue
      }
      if (!['http:', 'https:'].includes(url.protocol)) {
        add(`unsupported:${url.href}`, url.href, { status: 'warning', code: 'UNSUPPORTED_PROTOCOL', message: `Cannot check ${url.protocol}` }, reference)
        continue
      }
      if (isExampleHost(url.hostname, config)) {
        add(`example:${url.href}`, url.href, { status: 'skipped', code: 'EXAMPLE_URL', message: 'Local service or explicitly configured example host' }, reference)
        continue
      }
      if (url.username || url.password) {
        add(`credentials:${url.href}`, url.href, { status: 'warning', code: 'URL_CREDENTIALS', message: 'URLs containing credentials need manual verification' }, reference)
        continue
      }
      const result = resolveInternal(url, artifacts, config)
      if (result.status !== 'external') {
        add(`internal:${url.href}`, url.href, result, reference)
        continue
      }
      const target = new URL(result.target)
      if (target.hash) externalFragmentsUnchecked++
      target.hash = ''
      add(`external:${target.href}`, target.href, { status: 'pending', code: 'EXTERNAL' }, reference)
    }
  }
  const pending = [...groups.values()].filter(item => item.status === 'pending')
  let incomplete = false
  if (options.internalOnly) {
    for (const item of pending) Object.assign(item, { status: 'skipped', code: 'EXTERNAL_DISABLED', message: 'External requests disabled by --internal-only' })
  } else {
    const network = await checkExternalLinks(pending.map(item => item.target), config, options)
    incomplete = network.incomplete
    for (const item of pending) {
      let result = network.results.get(item.target)
      if (result.status === 'internal') {
        const redirectedUrl = result.target
        const httpResult = { ...result }
        delete httpResult.target
        result = { ...httpResult, finalUrl: redirectedUrl, ...resolveInternal(new URL(redirectedUrl), artifacts, config) }
        // Alternating external / internal refresh redirects are not verified by this HTTP probe.
        if (result.status === 'external') result = { ...result, status: 'warning', code: 'MIXED_REDIRECT_CHAIN', message: 'Mixed external and HTML refresh redirect chain needs verification' }
      }
      Object.assign(item, result)
    }
  }
  const results = [...groups.values()].sort((a, b) => a.target.localeCompare(b.target) || a.code.localeCompare(b.code))
  const counts = { ok: 0, error: 0, warning: 0, skipped: 0 }
  for (const result of results) counts[result.status]++
  return {
    schemaVersion: 1, checkedAt: new Date().toISOString(), mode: options.internalOnly ? 'internal-only' : 'all',
    siteUrl: config.siteUrl, complete: !incomplete,
    summary: { documents: artifacts.documents.length, references, uniqueTargets: results.length, ...counts,
      externalUrls: pending.length, externalFragmentsUnchecked },
    results, exitCode: incomplete ? 2 : counts.error > 0 ? 1 : 0
  }
}
