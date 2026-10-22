import fetch from 'node-fetch'

const redirectStatuses = new Set([301, 302, 303, 307, 308])

export function isExampleHost(hostname, config) {
  return config.exampleHosts.includes(hostname.toLowerCase())
    || hostname.endsWith('.localhost') || /^127\./.test(hostname)
}

function delay(ms, signal) {
  if (signal.aborted || ms === 0) return Promise.resolve()
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', finish)
      resolve()
    }
    const timer = setTimeout(finish, ms)
    signal.addEventListener('abort', finish, { once: true })
  })
}

function createOriginLimiter(limit) {
  const origins = new Map()
  return async (origin, fn) => {
    if (!origins.has(origin)) origins.set(origin, { running: 0, waiting: [] })
    const state = origins.get(origin)
    if (state.running >= limit) await new Promise(resolve => state.waiting.push(resolve))
    else state.running++
    try {
      return await fn()
    } finally {
      const next = state.waiting.shift()
      if (next) next()
      else state.running--
    }
  }
}

export async function checkExternalLinks(urls, config, options = {}) {
  const fetchImpl = options.fetchImpl || fetch
  const controller = new AbortController()
  const { signal } = controller
  const deadline = setTimeout(() => controller.abort(new Error('External link check exceeded maxDurationMs')), config.maxDurationMs)
  const limitOrigin = createOriginLimiter(config.perOriginConcurrency)
  const results = new Map()
  let nextIndex = 0

  async function request(url, method) {
    return limitOrigin(url.origin, async () => {
      if (signal.aborted) return { status: 'warning', code: 'CHECK_TIMEOUT', message: 'Overall check deadline exceeded' }
      const requestController = new AbortController()
      const abort = () => requestController.abort()
      signal.addEventListener('abort', abort, { once: true })
      const timer = setTimeout(() => requestController.abort(), config.timeoutMs)
      try {
        const response = await fetchImpl(url.href, {
          method, redirect: 'manual', signal: requestController.signal,
          headers: { 'User-Agent': 'MemOS-Docs-Link-Checker/1.0', 'Accept': '*/*' }
        })
        const result = { statusCode: response.status, location: response.headers.get('location') }
        // Do not download entire images, videos or archives for a GET probe.
        if (typeof response.body?.destroy === 'function') response.body.destroy()
        else if (response.body?.cancel) await response.body.cancel()
        return result
      } catch (error) {
        return { status: 'warning', code: signal.aborted ? 'CHECK_TIMEOUT' : requestController.signal.aborted ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
          message: error.message }
      } finally {
        clearTimeout(timer)
        signal.removeEventListener('abort', abort)
      }
    })
  }

  async function follow(original, method) {
    let url = new URL(original)
    const seen = new Set()
    const redirects = []
    for (;;) {
      if (config.internalOrigins.includes(url.origin)) {
        return { status: 'internal', code: 'INTERNAL_REDIRECT', target: url.href, redirects, method }
      }
      if (isExampleHost(url.hostname, config) || url.username || url.password) {
        return { status: 'warning', code: 'UNVERIFIABLE_REDIRECT', message: 'Redirect points to an example/local host or a URL containing credentials', redirects, method }
      }
      const key = new URL(url)
      key.hash = ''
      if (seen.has(key.href)) return { status: 'error', code: 'REDIRECT_LOOP', message: 'Redirect loop', redirects, method }
      seen.add(key.href)
      const response = await request(key, method)
      if (response.status) return { ...response, redirects, method }
      const { statusCode, location } = response
      if (redirectStatuses.has(statusCode)) {
        if (!location) return { status: 'warning', code: 'REDIRECT_WITHOUT_LOCATION', message: 'Redirect has no Location header', statusCode, redirects, method }
        if (redirects.length >= config.maxRedirects) {
          return { status: 'error', code: 'TOO_MANY_REDIRECTS', message: `More than ${config.maxRedirects} redirects`, statusCode, redirects, method }
        }
        let target
        try {
          target = new URL(location, url)
        } catch {
          return { status: 'error', code: 'INVALID_REDIRECT', message: 'Invalid redirect Location', statusCode, redirects, method }
        }
        if (!['http:', 'https:'].includes(target.protocol)) {
          return { status: 'warning', code: 'UNSUPPORTED_REDIRECT', message: `Redirect protocol ${target.protocol} cannot be checked`, statusCode, redirects, method }
        }
        if (!location.includes('#')) target.hash = url.hash
        redirects.push({ from: url.href, to: target.href, statusCode })
        url = target
        continue
      }
      if (statusCode >= 200 && statusCode < 300) return { status: 'ok', code: 'HTTP_OK', statusCode, finalUrl: url.href, redirects, method }
      if (statusCode === 404 || statusCode === 410) {
        return { status: 'error', code: 'HTTP_BROKEN', message: `HTTP ${statusCode}`, statusCode, finalUrl: url.href, redirects, method }
      }
      return { status: 'warning', code: 'HTTP_UNVERIFIED', message: `HTTP ${statusCode}; may require authentication or be temporarily unavailable`, statusCode, finalUrl: url.href, redirects, method }
    }
  }

  async function probe(url) {
    const head = await follow(url, 'HEAD')
    if (head.status === 'ok' || head.status === 'internal' || signal.aborted) return head
    let result
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      if (attempt) await delay(config.retryDelayMs * 2 ** (attempt - 1), signal)
      result = await follow(url, 'GET')
      result.attempts = attempt + 1
      const retryable = ['NETWORK_ERROR', 'REQUEST_TIMEOUT'].includes(result.code)
        || result.statusCode === 429 || result.statusCode >= 500
      if (!retryable || signal.aborted) break
    }
    return result
  }

  try {
    await Promise.all(Array.from({ length: Math.min(config.concurrency, urls.length) }, async () => {
      while (nextIndex < urls.length && !signal.aborted) {
        const url = urls[nextIndex++]
        results.set(url, await probe(url))
        options.onProgress?.(results.size, urls.length)
      }
    }))
    for (const url of urls) {
      if (!results.has(url)) results.set(url, { status: 'warning', code: 'CHECK_TIMEOUT', message: 'Not checked before the overall deadline' })
    }
    const unavailable = [...results.values()].filter(result => result.status === 'warning').length
    const incomplete = signal.aborted || (urls.length >= config.incompleteMinUrls && unavailable / urls.length > config.incompleteRatio)
    return { results, incomplete, unavailable }
  } finally {
    clearTimeout(deadline)
  }
}
