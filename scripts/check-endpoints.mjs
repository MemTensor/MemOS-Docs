import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const locales = ['cn', 'en']
const scanSections = [
  'api_docs',
  'memos_cloud',
  'mcp_agent',
  'openclaw',
  'self_developed_model',
  'usecase',
]

const legacyEndpointChecks = [
  {
    name: 'legacy messages endpoint',
    pattern: /(?<![A-Za-z0-9_-])\/messages(?:\/(?![A-Za-z0-9_-])|(?=[\s"'`)<},.;:!?]|$))/g,
    replacement: '/add/message',
  },
  {
    name: 'legacy search endpoint',
    pattern: /(?<![A-Za-z0-9_-])\/search(?:\/(?!memory\b)|(?=[\s"'`)<},.;:!?]|$))/g,
    replacement: '/search/memory',
  },
]

const openapiFrontmatterPattern =
  /openapi:\s*["'](?:GET|POST|PUT|PATCH|DELETE)\s+(\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*)["']/g
const fullCloudUrlPattern =
  /https:\/\/memos\.memtensor\.cn\/api\/openmem\/v1(\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*)/g
const baseUrlConcatPattern =
  /(?:MEMOS_BASE_URL|BASE_URL|self\.base_url|os\.environ\[['"]MEMOS_BASE_URL['"]\])[^/\n]{0,120}(\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)+)/g

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function walkMarkdown(dir) {
  const result = []

  function walk(current) {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry)
      const stat = statSync(path)
      if (stat.isDirectory()) {
        walk(path)
      } else if (path.endsWith('.md')) {
        result.push(path)
      }
    }
  }

  if (statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
    walk(dir)
  }

  return result
}

function lineAndColumn(text, index) {
  const before = text.slice(0, index)
  const lines = before.split('\n')
  return { line: lines.length, column: lines[lines.length - 1].length + 1 }
}

function addFinding(findings, file, text, index, message) {
  const loc = lineAndColumn(text, index)
  findings.push(`${relative(root, file)}:${loc.line}:${loc.column} ${message}`)
}

function normalizeEndpoint(endpoint) {
  return endpoint.replace(/[),.;:'"`\]}]+$/g, '').replace(/\/$/, '')
}

function endpointMatches(text) {
  const matches = []
  const patterns = [
    openapiFrontmatterPattern,
    fullCloudUrlPattern,
  ]

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      matches.push({ endpoint: normalizeEndpoint(match[1]), index: match.index })
    }
  }

  const lines = text.split('\n')
  let offset = 0
  for (const line of lines) {
    if (
      !line.includes('https://') &&
      (line.includes('MEMOS_BASE_URL') || line.includes('BASE_URL') || line.includes('self.base_url'))
    ) {
      for (const match of line.matchAll(baseUrlConcatPattern)) {
        matches.push({ endpoint: normalizeEndpoint(match[1]), index: offset + match.index })
      }
    }
    offset += line.length + 1
  }

  return matches
}

const localePaths = new Map()

for (const locale of locales) {
  const apiPath = join(root, 'content', locale, 'api_docs', 'api.json')
  const api = readJson(apiPath)
  localePaths.set(locale, new Set(Object.keys(api.paths ?? {})))
}

const [firstLocale, ...otherLocales] = locales
const firstPaths = localePaths.get(firstLocale)
const findings = []

for (const locale of otherLocales) {
  const paths = localePaths.get(locale)
  for (const path of firstPaths) {
    if (!paths.has(path)) {
      findings.push(`content/${locale}/api_docs/api.json is missing OpenAPI path ${path}`)
    }
  }
  for (const path of paths) {
    if (!firstPaths.has(path)) {
      findings.push(`content/${locale}/api_docs/api.json has extra OpenAPI path ${path}`)
    }
  }
}

for (const locale of locales) {
  const allowedPaths = localePaths.get(locale)
  const files = scanSections.flatMap((section) =>
    walkMarkdown(join(root, 'content', locale, section)),
  )

  for (const file of files) {
    const text = readFileSync(file, 'utf8')

    for (const check of legacyEndpointChecks) {
      for (const match of text.matchAll(check.pattern)) {
        addFinding(
          findings,
          file,
          text,
          match.index,
          `${check.name}: use ${check.replacement}`,
        )
      }
    }

    for (const match of endpointMatches(text)) {
      const endpoint = match.endpoint
      if (!allowedPaths.has(endpoint)) {
        addFinding(
          findings,
          file,
          text,
          match.index,
          `endpoint ${endpoint} is not declared in content/${locale}/api_docs/api.json`,
        )
      }
    }
  }
}

if (findings.length > 0) {
  console.error('Endpoint consistency check failed:\n')
  console.error(findings.map((finding) => `- ${finding}`).join('\n'))
  process.exit(1)
}

console.log('Endpoint consistency check passed.')
