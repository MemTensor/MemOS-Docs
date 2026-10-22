import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { validateConfig } from './config.mjs'
import { parseHtml, parseMarkdown, scanArtifacts } from './scan.mjs'
import { checkLinks } from './check.mjs'
import { checkExternalLinks } from './network.mjs'
import { writeReports } from './report.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const defaults = JSON.parse(readFileSync(new URL('../check-links.config.json', import.meta.url), 'utf8'))
const origin = 'https://memos-docs.openmem.net'
const config = overrides => validateConfig({ ...structuredClone(defaults), retryDelayMs: 0, ...overrides })
const response = (status, location) => new Response(null, { status, headers: location ? { location } : {} })

function fixture(t, files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'docs-links-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    writeFileSync(path.join(dir, file), content)
  }
  return { dir, artifacts: scanArtifacts(dir, origin) }
}

test('HTML parses entities, resource links, srcset and explicit named anchors', () => {
  const html = '<a name="legacy"></a><h2 id="中文">Title</h2>\n<a href="/x?a=1&amp;b=2">x</a>'
    + '<img src="/one.png" srcset="data:image/png;base64,AAAA 1x, /two.png 2x">'
    + '<source src="/clip.mp4"><video poster="/poster.png"></video><iframe src="/frame"></iframe>'
    + '<pre><a href="/example-only">sample</a></pre>'
  const parsed = parseHtml(html)
  assert.deepEqual([...parsed.ids], ['legacy', '中文'])
  assert.deepEqual(parsed.links.map(link => link.url), ['/x?a=1&b=2', '/one.png', 'data:image/png;base64,AAAA', '/two.png', '/clip.mp4', '/poster.png', '/frame'])
  assert.equal(parsed.links[0].line, 2)
})

test('Markdown handles references, images, raw HTML, GFM URLs and ignores examples / frontmatter', () => {
  const md = '\uFEFF---\ntitle: https://metadata.test\n---\n[ref][site]\n\n[site]: /target\n'
    + '![image](/a.png)\n<a href="/raw">raw</a>\nhttps://remote.test/path\n'
    + '`[inline](/fake)`\n```md\n[example](/not-real)\n```\n'
  const links = parseMarkdown(md).links
  assert.deepEqual(links.map(link => link.url), ['/target', '/a.png', '/raw', 'https://remote.test/path'])
  assert.equal(links[0].line, 4)
})

test('checks actual output routes, encoded paths, exact resources and HTML anchors', async (t) => {
  const { artifacts } = fixture(t, {
    'index.html': '<a href="/cn/中文/?q=1#标题">中文</a><a href="/cn/中文#legacy">old</a><a href="/flat">flat</a><a href="/api.json">api</a><img src="/a.png">',
    'cn/中文/index.html': '<h2 id="标题">标题</h2><a name="legacy"></a><a href="#top">top</a>',
    'flat.html': '<h1>flat</h1>', 'a.png': 'image', 'api.json': '{}'
  })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.equal(report.exitCode, 0)
  assert.equal(report.summary.ok, 6)
})

test('relative links are resolved using the published URL of each output format', async (t) => {
  const { artifacts } = fixture(t, {
    'section/page/index.html': '<a href="../sibling/">sibling</a>',
    'section/sibling/index.html': '<h1>Sibling</h1>',
    'section/page.md': '[sibling](./sibling.md)', 'section/sibling.md': 'Sibling',
    'index.html': '<h1>Home</h1>', 'llms-full.txt': '[broken from aggregate](./sibling.md)'
  })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.equal(report.summary.error, 1)
  assert.equal(report.results.find(result => result.status === 'error').target, `${origin}/sibling.md`)
})

test('missing files, missing anchors and malformed encodings block; Markdown fragments are unverified', async (t) => {
  const { artifacts } = fixture(t, {
    'index.html': '<a href="/missing">missing</a><a href="/target#wrong">wrong</a><a href="/%ZZ">bad</a><a href="/target.md#heading">md</a><a href="http://[">invalid</a>',
    'target/index.html': '<h2 id="right">Right</h2>', 'target.md': '## heading'
  })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.equal(report.exitCode, 1)
  assert.equal(report.summary.error, 4)
  assert.equal(report.summary.warning, 1)
  assert.equal(report.results.find(result => result.status === 'warning').code, 'NON_HTML_FRAGMENT')
})

test('a Markdown URL must have its own artifact; an HTML page is not a substitute', async (t) => {
  const { artifacts } = fixture(t, { 'index.html': '<a href="/page.md">md</a>', 'page/index.html': '<h1>Page</h1>' })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.equal(report.results[0].code, 'MISSING_FILE')
})

test('canonical site URLs use this build, deduplicate and retain all occurrences', async (t) => {
  const { artifacts } = fixture(t, {
    'index.html': `<a href="${origin}/deleted">a</a><a href="/deleted">b</a>`,
    'page.md': '[same](/deleted)', 'llms.txt': '- [same](/deleted)'
  })
  const report = await checkLinks(artifacts, config(), { fetchImpl: () => assert.fail('must not request the deployed site') })
  assert.equal(report.summary.error, 1)
  assert.equal(report.results[0].references.length, 4)
})

test('skip configured examples and non-HTTP links, without ignoring similarly named real domains', async (t) => {
  const { artifacts } = fixture(t, {
    'index.html': '<a href="http://localhost:8000/docs">local</a><a href="http://127.0.0.2/">loopback</a><a href="https://example.com/">example</a><a href="mailto:a@b.com">mail</a><a href="https://real-example.test/">real</a>'
  })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.equal(report.summary.skipped, 5)
  assert.equal(report.results.find(result => result.target.includes('real-example')).code, 'EXTERNAL_DISABLED')
})

test('valid scoped exceptions do not suppress other occurrences of the same URL', async (t) => {
  const { artifacts } = fixture(t, { 'index.html': '<a href="/missing">a</a>', 'other.md': '[missing](/missing)' })
  const settings = config({ exceptions: [{ url: `${origin}/missing`, source: '/', reason: 'Tracked issue', owner: 'docs', expires: '2099-01-01' }] })
  const report = await checkLinks(artifacts, settings, { internalOnly: true })
  assert.equal(report.summary.error, 1)
  assert.equal(report.summary.skipped, 1)
})

test('expired, missing-owner and invalid calendar date exceptions fail configuration', () => {
  const exception = { url: `${origin}/missing`, reason: 'temporary', owner: 'docs', expires: '2000-01-01' }
  assert.throws(() => config({ exceptions: [exception] }), /已过期/)
  assert.throws(() => config({ exceptions: [{ ...exception, expires: '2099-02-30' }] }), /无效/)
  assert.throws(() => config({ exceptions: [{ ...exception, owner: '', expires: '2099-01-01' }] }), /owner/)
  assert.throws(() => config({ concurrency: 0 }), /concurrency/)
})

test('internal refresh redirects validate destinations and detect loops', async (t) => {
  const { artifacts } = fixture(t, {
    'index.html': '<a href="/old">old</a><a href="/loop-a">loop</a>',
    'old/index.html': '<meta http-equiv="refresh" content="0; url=/target#right">',
    'target/index.html': '<h2 id="right">Right</h2>',
    'loop-a/index.html': '<meta http-equiv="refresh" content="0;url=/loop-b">',
    'loop-b/index.html': '<meta http-equiv="refresh" content="0;url=/loop-a">'
  })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.ok(report.results.some(result => result.code === 'REDIRECT_LOOP'))
  assert.equal(report.results.find(result => result.target === `${origin}/old`).status, 'ok')
})

test('HEAD 404 is rechecked with GET before declaring a link broken', async () => {
  const calls = []
  const report = await checkExternalLinks(['https://remote.test/'], config(), { fetchImpl: async (_url, { method }) => {
    calls.push(method)
    return response(method === 'HEAD' ? 404 : 200)
  } })
  assert.deepEqual(calls, ['HEAD', 'GET'])
  assert.equal(report.results.get('https://remote.test/').status, 'ok')
})

test('successful HEAD avoids downloading the resource body', async () => {
  const calls = []
  const report = await checkExternalLinks(['https://remote.test/'], config(), { fetchImpl: async (_url, { method }) => {
    calls.push(method)
    return response(200)
  } })
  assert.deepEqual(calls, ['HEAD'])
  assert.equal(report.incomplete, false)
})

for (const status of [404, 410]) {
  test(`GET ${status} is a blocking error`, async () => {
    const result = await checkExternalLinks(['https://remote.test/'], config(), { fetchImpl: async () => response(status) })
    assert.equal(result.results.get('https://remote.test/').code, 'HTTP_BROKEN')
    assert.equal(result.results.get('https://remote.test/').method, 'GET')
  })
}

for (const status of [401, 403, 429, 503]) {
  test(`HTTP ${status} remains unverified rather than a confirmed dead link`, async () => {
    const calls = []
    const result = await checkExternalLinks(['https://remote.test/'], config(), { fetchImpl: async (_url, { method }) => {
      calls.push(method)
      return response(status)
    } })
    assert.equal(result.results.get('https://remote.test/').status, 'warning')
    assert.equal(calls.filter(method => method === 'GET').length, status === 429 || status === 503 ? 3 : 1)
  })
}

test('a transient 429 retries and recovers', async () => {
  let calls = 0
  const result = await checkExternalLinks(['https://remote.test/'], config(), { fetchImpl: async () => response(++calls < 3 ? 429 : 200) })
  assert.equal(result.results.get('https://remote.test/').status, 'ok')
  assert.equal(calls, 3)
})

test('redirect loops and overlong chains are blocking after GET confirmation', async () => {
  const loop = await checkExternalLinks(['https://remote.test/a'], config(), { fetchImpl: async url => response(302, url.endsWith('/a') ? '/b' : '/a') })
  assert.equal(loop.results.get('https://remote.test/a').code, 'REDIRECT_LOOP')
  const chain = await checkExternalLinks(['https://remote.test/0'], config({ maxRedirects: 2 }), { fetchImpl: async url => response(301, `/${Number(new URL(url).pathname.slice(1)) + 1}`) })
  assert.equal(chain.results.get('https://remote.test/0').code, 'TOO_MANY_REDIRECTS')
})

test('external redirects back to the docs verify this build, not the deployed site', async (t) => {
  const { artifacts } = fixture(t, { 'index.html': '<a href="https://remote.test/">external</a>' })
  const report = await checkLinks(artifacts, config(), { fetchImpl: async (url) => {
    assert.equal(new URL(url).origin, 'https://remote.test')
    return response(302, `${origin}/missing`)
  } })
  assert.equal(report.exitCode, 1)
  assert.equal(report.results[0].code, 'MISSING_FILE')
})

test('outbound requests are deduplicated without losing query strings', async (t) => {
  const { artifacts } = fixture(t, { 'index.html': '<a href="https://remote.test/?a=1#one">1</a><a href="https://remote.test/?a=1#two">2</a><a href="https://remote.test/?a=2">3</a>' })
  const calls = []
  const report = await checkLinks(artifacts, config(), { fetchImpl: async (url) => {
    calls.push(url)
    return response(200)
  } })
  assert.deepEqual(calls.sort(), ['https://remote.test/?a=1', 'https://remote.test/?a=2'])
  assert.equal(report.summary.externalFragmentsUnchecked, 2)
})

test('global and per-origin concurrency are bounded, including redirect targets', async () => {
  let running = 0
  let peak = 0
  const origins = new Map()
  const peaks = new Map()
  const urls = Array.from({ length: 12 }, (_, i) => `https://${i < 6 ? 'one' : 'two'}.test/${i}`)
  await checkExternalLinks(urls, config({ concurrency: 4, perOriginConcurrency: 2 }), { fetchImpl: async (url) => {
    const host = new URL(url).host
    peak = Math.max(peak, ++running)
    origins.set(host, (origins.get(host) || 0) + 1)
    peaks.set(host, Math.max(peaks.get(host) || 0, origins.get(host)))
    await new Promise(resolve => setTimeout(resolve, 3))
    running--
    origins.set(host, origins.get(host) - 1)
    return response(200)
  } })
  assert.ok(peak <= 4)
  assert.ok([...peaks.values()].every(value => value <= 2))
})

test('request timeouts abort and a global deadline marks every unstarted target', async () => {
  const fetchImpl = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
  })
  const urls = Array.from({ length: 6 }, (_, i) => `https://remote.test/${i}`)
  const result = await checkExternalLinks(urls, config({ timeoutMs: 10, retries: 0, maxDurationMs: 35, concurrency: 1 }), { fetchImpl })
  assert.equal(result.incomplete, true)
  assert.equal(result.results.size, 6)
  assert.ok([...result.results.values()].some(value => value.code === 'CHECK_TIMEOUT'))
})

test('widespread unverifiable links return exit 2, not a successful full check', async (t) => {
  const links = Array.from({ length: 5 }, (_, i) => `<a href="https://remote.test/${i}">${i}</a>`).join('')
  const { artifacts } = fixture(t, { 'index.html': links })
  const report = await checkLinks(artifacts, config(), { fetchImpl: async () => response(403) })
  assert.equal(report.exitCode, 2)
  assert.equal(report.complete, false)
})

test('reports include every reference, commit, errors, unverified and skipped entries', async (t) => {
  const { dir, artifacts } = fixture(t, { 'index.html': '<a href="/missing">a</a><a href="/missing">b</a><a href="mailto:a@b">mail</a><a href="/index.html#:~:text=hello">text</a>' })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  report.commit = 'test-commit'
  const output = path.join(dir, 'reports')
  writeReports(report, output)
  const json = JSON.parse(readFileSync(path.join(output, 'links.json'), 'utf8'))
  const md = readFileSync(path.join(output, 'links.md'), 'utf8')
  assert.equal(json.commit, 'test-commit')
  assert.equal(json.language, 'zh-CN')
  assert.match(json.results.find(result => result.code === 'MISSING_FILE').message, /构建产物中不存在/)
  assert.match(md, /^# 文档链接完整检查报告/m)
  assert.match(md, /阻断错误：1 个；待确认：1 个；已跳过：1 个/)
  assert.match(md, /\| 来源文件 \| 行号:列号 \| 来源页面地址 \| 原始链接 \|/)
  assert.match(md, /北京时间/)
  assert.ok(md.includes('MISSING_FILE'))
  assert.ok(md.includes('TEXT_FRAGMENT_UNVERIFIED'))
  assert.ok(md.includes('NON_HTTP'))
  assert.equal(json.results.find(result => result.status === 'error').references.length, 2)
})

test('CLI returns 0 for valid artifacts and 1 for dead links, with JSON / Markdown reports', (t) => {
  const { dir } = fixture(t, { 'index.html': '<a href="#ok">ok</a><h2 id="ok">OK</h2>' })
  const reportDir = `${dir}-report`
  t.after(() => rmSync(reportDir, { recursive: true, force: true }))
  const args = ['scripts/check-links.mjs', '--internal-only', '--public-dir', dir, '--report-dir', reportDir]
  execFileSync(process.execPath, args, { cwd: root, stdio: 'pipe' })
  writeFileSync(path.join(dir, 'index.html'), '<a href="/missing">broken</a>')
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /阻断错误=1/)
  assert.match(result.stderr, /构建产物中不存在/)
  assert.equal(JSON.parse(readFileSync(path.join(reportDir, 'links.json'), 'utf8')).exitCode, 1)
})

test('CLI missing build output returns 2 and writes an incomplete report', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'docs-links-empty-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const result = spawnSync(process.execPath, ['scripts/check-links.mjs', '--public-dir', path.join(dir, 'missing'), '--report-dir', path.join(dir, 'report')], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 2)
  assert.equal(JSON.parse(readFileSync(path.join(dir, 'report/links.json'), 'utf8')).complete, false)
})

test('HTML base is respected and code block element IDs remain valid anchor targets', async (t) => {
  const { artifacts } = fixture(t, {
    'index.html': '<base href="/nested/"><a href="target/">target</a>',
    'nested/target/index.html': '<a href="#sample">code</a><pre id="sample"><a href="/not-a-link">example</a></pre>'
  })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.equal(report.exitCode, 0)
  assert.equal(report.summary.references, 2)
})

test('anchor IDs are case-sensitive and raw HTML fragments in Markdown keep their line numbers', async (t) => {
  const { artifacts } = fixture(t, {
    'index.html': '<h2 id="Case">Case</h2><a href="#case">wrong case</a>',
    'page.md': '# Page\n\nText\n\n<a href="/missing">broken</a>'
  })
  const report = await checkLinks(artifacts, config(), { internalOnly: true })
  assert.equal(report.summary.error, 2)
  assert.equal(report.results.find(result => result.code === 'MISSING_FILE').references[0].line, 5)
})

test('external redirect reports retain the original target URL', async (t) => {
  const { artifacts } = fixture(t, { 'index.html': '<a href="https://remote.test/old">external</a>' })
  const report = await checkLinks(artifacts, config(), { fetchImpl: async () => response(301, `${origin}/missing`) })
  assert.equal(report.results[0].target, 'https://remote.test/old')
  assert.equal(report.results[0].finalUrl, `${origin}/missing`)
})

test('network failure cannot pass when enough external URLs are unverified', async () => {
  const urls = Array.from({ length: 5 }, (_, i) => `https://remote.test/${i}`)
  const report = await checkExternalLinks(urls, config({ retries: 0 }), { fetchImpl: async () => {
    throw new Error('DNS unavailable')
  } })
  assert.equal(report.incomplete, true)
  assert.ok([...report.results.values()].every(result => result.code === 'NETWORK_ERROR'))
})

test('request bodies are canceled when GET headers are sufficient', async () => {
  let canceled = false
  await checkExternalLinks(['https://remote.test/'], config(), { fetchImpl: async (_url, { method }) => {
    if (method === 'HEAD') return response(405)
    return new Response(new ReadableStream({
      cancel() {
        canceled = true
      }
    }), { status: 200 })
  } })
  assert.equal(canceled, true)
})

test('CLI rejects a report directory inside the deployed tree without writing it there', (t) => {
  const { dir } = fixture(t, { 'index.html': '<h1>Home</h1>' })
  const result = spawnSync(process.execPath, ['scripts/check-links.mjs', '--public-dir', dir, '--report-dir', path.join(dir, 'reports')], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 2)
  assert.match(result.stderr, /拒绝将检查报告写入/)
  assert.throws(() => readFileSync(path.join(dir, 'reports/links.json')))
})
