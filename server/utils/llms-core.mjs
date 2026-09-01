import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// repoRoot is used by build scripts (export-llms.mjs, export-markdown.mjs) and dev middleware.
// In production, these functions are never called — static files are served instead.
const repoRoot = fs.existsSync(path.resolve(__dirname, '../../content'))
  ? path.resolve(__dirname, '../..')
  : process.cwd()

const TEXT_PLAIN_UTF8 = { 'Content-Type': 'text/plain; charset=utf-8' }

function stripNavLabel(label) {
  return label.replace(/^\([^)]+\)\s*/, '').trim()
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { meta: {}, body: content }
  const fm = match[1]
  const meta = {}
  for (const line of fm.split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (m) meta[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1')
  }
  const body = content.replace(/^---\n[\s\S]*?\n---\n*/, '').trim()
  return { meta, body }
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function parseOpenApiField(value) {
  const match = value?.match(/^(\w+)\s+(.+)$/)
  if (!match) return null
  return { method: match[1].toLowerCase(), apiPath: match[2] }
}

function lookupOperation(spec, openapiField) {
  const parsed = parseOpenApiField(openapiField)
  if (!parsed || !spec?.paths?.[parsed.apiPath]?.[parsed.method]) return null
  return { ...parsed, operation: spec.paths[parsed.apiPath][parsed.method] }
}

function summaryToRoute(summary) {
  return summary.split(' ').map(part => part.toLowerCase()).join('-')
}

function expandApiReferenceEntries(spec, urlPrefix) {
  if (!spec?.paths) return []
  const entries = []
  for (const [apiPath, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue
      if (!operation.summary) continue
      const slug = summaryToRoute(operation.summary)
      entries.push({
        title: operation.summary,
        desc: operation.description || '',
        url: `${urlPrefix}/api-reference/${slug}`,
        kind: 'api-reference',
        method: method.toUpperCase(),
        apiPath,
        operation
      })
    }
  }
  return entries
}

function resolveMdEntry(mdPath, localePrefix, contentRoot, dashboardApiSpec) {
  const fullPath = path.join(contentRoot, mdPath)
  if (!fs.existsSync(fullPath)) return null

  const raw = fs.readFileSync(fullPath, 'utf8')
  const { meta, body } = extractFrontmatter(raw)
  const title = meta.title || ''
  if (!title) return null

  const urlPath = mdPath.replace(/\.md$/, '').replace(/\/index$/, '')
  const url = `${localePrefix}/${urlPath}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/'

  if (body === '<!-- Menu Mapping -->' && meta.openapi) {
    const hit = lookupOperation(dashboardApiSpec, meta.openapi)
    if (!hit) return null
    return {
      title,
      desc: hit.operation.description || '',
      url,
      kind: 'api-doc',
      method: hit.method.toUpperCase(),
      apiPath: hit.apiPath,
      operation: hit.operation
    }
  }

  if (!body || body === '<!-- Menu Mapping -->') return null

  return { title, desc: meta.desc || '', url, kind: 'doc', body }
}

function resolveNavValue(value, localePrefix, contentRoot, dashboardApiSpec, restApiSpec) {
  if (typeof value !== 'string') return []
  if (value.endsWith('.md')) {
    const entry = resolveMdEntry(value, localePrefix, contentRoot, dashboardApiSpec)
    return entry ? [entry] : []
  }
  if (value.startsWith('api-reference/')) {
    return expandApiReferenceEntries(restApiSpec, localePrefix || '')
  }
  return []
}

function walkNavItems(items, localePrefix, contentRoot, dashboardApiSpec, restApiSpec) {
  const entries = []
  const groups = []

  for (const item of items) {
    const [label, value] = Object.entries(item)[0]
    const cleanLabel = stripNavLabel(label)

    if (typeof value === 'string') {
      entries.push(...resolveNavValue(value, localePrefix, contentRoot, dashboardApiSpec, restApiSpec))
      continue
    }
    if (!Array.isArray(value)) continue

    const nested = walkNavItems(value, localePrefix, contentRoot, dashboardApiSpec, restApiSpec)
    if (nested.entries.length || nested.groups.length) {
      groups.push({ title: cleanLabel, entries: nested.entries, groups: nested.groups })
    }
  }
  return { entries, groups }
}

export function parseSettingsNav(locale) {
  const isCn = locale === 'cn'
  const localePrefix = isCn ? '/cn' : ''
  const settingsPath = path.join(repoRoot, 'content', locale, 'settings.yml')
  const contentRoot = path.join(repoRoot, 'content', locale)
  const dashboardApiSpec = loadJson(path.join(contentRoot, 'api_docs', 'api.json'))
  const restApiSpec = loadJson(path.join(repoRoot, 'content', 'api.json'))

  const settings = yaml.load(fs.readFileSync(settingsPath, 'utf8'))
  const sections = []

  for (const section of settings.nav) {
    const [label, value] = Object.entries(section)[0]
    if (!Array.isArray(value)) continue
    const { entries, groups } = walkNavItems(value, localePrefix, contentRoot, dashboardApiSpec, restApiSpec)
    sections.push({ title: stripNavLabel(label), entries, groups })
  }

  return { locale, localePrefix, contentRoot, dashboardApiSpec, sections }
}

function flattenEntries(sections) {
  const all = []
  function walk(node) {
    all.push(...node.entries)
    for (const group of node.groups || []) walk(group)
  }
  for (const section of sections) walk(section)
  return all
}

// --- Rendering ---

function renderEntryLine(entry) {
  let line = `- [${entry.title}](${entry.url})`
  if (entry.kind === 'api-doc' || entry.kind === 'api-reference') {
    line += ` \`${entry.method} ${entry.apiPath}\``
  }
  if (entry.desc) line += `: ${entry.desc.replace(/\s+/g, ' ').slice(0, 200).trim()}`
  return line
}

function renderGroup(group, depth = 3) {
  const lines = []
  const heading = '#'.repeat(Math.min(depth, 6))
  lines.push(`${heading} ${group.title}`, '')
  for (const entry of group.entries) lines.push(renderEntryLine(entry))
  if (group.entries.length) lines.push('')
  for (const sub of group.groups || []) lines.push(...renderGroup(sub, depth + 1))
  return lines
}

function renderSections(sections) {
  const lines = []
  for (const section of sections) {
    lines.push(`## ${section.title}`, '')
    for (const entry of section.entries) lines.push(renderEntryLine(entry))
    if (section.entries.length) lines.push('')
    for (const group of section.groups || []) lines.push(...renderGroup(group))
  }
  return lines.join('\n')
}

function loadHeader() {
  const candidates = [
    path.join(__dirname, 'llms-header.md'),
    path.join(repoRoot, 'server', 'utils', 'llms-header.md')
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8')
  }
  return ''
}

// --- Public API ---

export function generateLlmsTxt(locales = ['en', 'cn']) {
  const header = loadHeader()
  const body = locales.map(locale => renderSections(parseSettingsNav(locale).sections)).join('\n')
  return `${header.trimEnd()}\n\n${body.trimEnd()}\n`
}

export function stripNuxtComponents(text) {
  // Convert :::card blocks to markdown (handles indentation)
  text = text.replace(/[ \t]*:::card\s*\n[ \t]*---\n([\s\S]*?)\n[ \t]*---\n([\s\S]*?):::/g, (_, frontmatter, body) => {
    const title = frontmatter.match(/title:\s*(.+)/)?.[1]?.trim() || ''
    const to = frontmatter.match(/to:\s*(.+)/)?.[1]?.trim() || ''
    const desc = body.trim().replace(/<br\s*\/?>/g, '\n')
    if (title && to) return desc ? `- [${title}](${to}): ${desc}` : `- [${title}](${to})`
    if (title && desc) return `**${title}**: ${desc}`
    if (title) return `**${title}**`
    return desc
  })

  // Convert :::note/:::warning/:::tip/:::caution — keep inner content with prefix (2 or 3 colons)
  text = text.replace(/\s*:{2,3}(tip|warning|note|caution|info|alert)[^\n]*\n([\s\S]*?):{2,3}\s*$/gm, (_, type, body) => {
    const prefix = type.charAt(0).toUpperCase() + type.slice(1)
    const content = body.trim()
    if (!content) return ''
    return `\n> **${prefix}**: ${content.replace(/\n/g, '\n> ')}`
  })

  // Strip :::steps and other ::: blocks — keep inner content
  text = text.replace(/\s*:::\w[^\n]*\n([\s\S]*?):::/g, (_, body) => {
    return '\n' + body.trim()
  })

  // Strip :: two-colon component markers (::card-group, ::steps, ::code-group, etc.)
  text = text.replace(/^:{2,3}[\w-]+[^\n]*/gm, '')
  text = text.replace(/^:{2,3}\s*$/gm, '')

  // Strip single-colon inline component markers (:steps{}, :list{}, :span{}, etc.)
  text = text.replace(/^:[a-z][\w-]*\{[^}]*\}\s*$/gm, '')

  // Convert <details>/<summary> to markdown (keep content accessible)
  text = text.replace(/<details[^>]*>\s*\n\s*<summary[^>]*>\s*([\s\S]*?)\s*<\/summary>/g,
    (_, summary) => `**${summary.trim()}**`)
  text = text.replace(/<\/details>/g, '')

  // Strip noisy HTML attributes (class, style) — keep tags readable for agents
  text = text.replace(/(<\w+)\s+class="[^"]*"/g, '$1')
  text = text.replace(/(<\w+)\s+style="[^"]*"/g, '$1')
  text = text.replace(/<div>\s*\n/g, '\n')
  text = text.replace(/<\/div>\s*\n/g, '\n')

  // Convert <a> tags to markdown links
  text = text.replace(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)')

  // Strip <br> tags
  text = text.replace(/<br\s*\/?>/g, '\n')

  // Clean up excessive blank lines
  text = text.replace(/^:::>\s*/gm, '> ')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

function renderLlmsFullForLocale(locale) {
  const { sections, dashboardApiSpec } = parseSettingsNav(locale)
  const entries = flattenEntries(sections)
  const pages = []

  for (const entry of entries) {
    if (entry.kind === 'doc') {
      const cleaned = stripNuxtComponents(entry.body)
      pages.push(`# ${entry.title} (${entry.url})\n\n${cleaned}`)
    } else if (entry.kind === 'api-doc' && entry.operation) {
      const rendered = renderOpenApiMarkdown(entry.title, entry.method, entry.apiPath, entry.operation, dashboardApiSpec)
      pages.push(`${rendered.trim()}\n\nURL: ${entry.url}`)
    } else if (entry.kind === 'api-reference' && entry.operation) {
      const rendered = renderOpenApiMarkdown(entry.title, entry.method, entry.apiPath, entry.operation, dashboardApiSpec)
      pages.push(`${rendered.trim()}\n\nURL: ${entry.url}`)
    } else {
      const lines = [`# ${entry.title} (${entry.url})`, '']
      if (entry.method && entry.apiPath) lines.push(`**${entry.method}** \`${entry.apiPath}\``, '')
      if (entry.desc) lines.push(entry.desc, '')
      if (entry.operation?.operationId) lines.push(`operationId: \`${entry.operation.operationId}\``)
      pages.push(lines.join('\n').trim())
    }
  }

  return pages.join('\n\n---\n\n').trimEnd() + '\n'
}

export function generateLlmsFullTxt(locales = ['en', 'cn']) {
  return locales.map(locale => renderLlmsFullForLocale(locale).trimEnd()).join('\n\n---\n\n') + '\n'
}

export function generateSitemapXml(siteUrl = 'https://memos-docs.openmem.net') {
  const routes = new Set(['/', '/cn', '/changelog', '/cn/changelog'])
  for (const locale of ['en', 'cn']) {
    for (const entry of flattenEntries(parseSettingsNav(locale).sections)) {
      routes.add(entry.url)
    }
  }

  const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  const entries = [...routes].map(route => {
    const url = new URL(`${route.replace(/\/$/, '')}/`, siteUrl).href
    return `  <url><loc>${escapeXml(url)}</loc></url>`
  })

  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + entries.join('\n') + '\n</urlset>\n'
}

export function writeStaticLlmsFiles(outputDir, locales = ['en', 'cn']) {
  fs.mkdirSync(outputDir, { recursive: true })
  const UTF8_BOM = '\uFEFF'
  const files = {
    'llms.txt': generateLlmsTxt(locales),
    'llms-full.txt': generateLlmsFullTxt(locales)
  }
  for (const [name, content] of Object.entries(files)) {
    // BOM helps browsers detect UTF-8 when OSS serves text/plain without charset
    fs.writeFileSync(path.join(outputDir, name), UTF8_BOM + content, 'utf8')
  }
  return Object.keys(files)
}

export function textResponse(content) {
  return new Response(content, { headers: TEXT_PLAIN_UTF8 })
}

export function countNavEntries(locale) {
  return flattenEntries(parseSettingsNav(locale).sections).length
}

// --- Full OpenAPI → Markdown rendering ---

function resolveRef(ref, spec) {
  if (!ref || !ref.startsWith('#/')) return null
  const parts = ref.replace('#/', '').split('/')
  let obj = spec
  for (const p of parts) {
    obj = obj?.[p]
    if (!obj) return null
  }
  return obj
}

function resolveSchema(schema, spec, depth = 0) {
  if (!schema) return null
  if (schema.$ref) return resolveSchema(resolveRef(schema.$ref, spec), spec, depth)
  if (schema.oneOf) return { ...schema, oneOf: schema.oneOf.map(s => resolveSchema(s, spec, depth)) }
  if (schema.allOf) {
    const merged = { type: 'object', properties: {}, required: [] }
    for (const s of schema.allOf) {
      const resolved = resolveSchema(s, spec, depth)
      Object.assign(merged.properties, resolved?.properties || {})
      merged.required.push(...(resolved?.required || []))
    }
    return merged
  }
  if (schema.type === 'array' && schema.items) {
    return { ...schema, items: resolveSchema(schema.items, spec, depth + 1) }
  }
  if (schema.type === 'object' && schema.properties && depth < 3) {
    const resolved = { ...schema, properties: {} }
    for (const [k, v] of Object.entries(schema.properties)) {
      resolved.properties[k] = resolveSchema(v, spec, depth + 1)
    }
    return resolved
  }
  return schema
}

function typeLabel(schema) {
  if (!schema) return 'any'
  if (schema.$ref) return schema.$ref.split('/').pop()
  if (schema.oneOf) return schema.oneOf.map(typeLabel).join(' | ')
  if (schema.type === 'array') return `array<${typeLabel(schema.items)}>`
  if (schema.enum) return `${schema.type} (enum: ${schema.enum.join(', ')})`
  return schema.type || 'any'
}

function renderPropertiesTable(schema, requiredFields = []) {
  if (!schema?.properties) return ''
  const lines = ['| Parameter | Type | Required | Description |', '|---|---|---|---|']
  for (const [name, prop] of Object.entries(schema.properties)) {
    const required = requiredFields.includes(name) ? 'Yes' : 'No'
    const type = typeLabel(prop)
    const desc = (prop.description || '').replace(/\n/g, ' ').replace(/\|/g, '\\|')
    lines.push(`| \`${name}\` | ${type} | ${required} | ${desc} |`)
  }
  return lines.join('\n')
}

function renderNestedSchemas(schema, spec, rendered = new Set()) {
  if (!schema?.properties) return ''
  const blocks = []
  for (const [name, prop] of Object.entries(schema.properties)) {
    let inner = prop
    if (inner.type === 'array' && inner.items) inner = inner.items
    if (inner.type === 'object' && inner.properties && !rendered.has(name)) {
      rendered.add(name)
      blocks.push(`#### \`${name}\` object\n\n${renderPropertiesTable(inner, inner.required || [])}`)
      blocks.push(renderNestedSchemas(inner, spec, rendered))
    }
    if (inner.oneOf) {
      for (const variant of inner.oneOf) {
        if (variant.type === 'object' && variant.properties && !rendered.has(name)) {
          rendered.add(name)
          blocks.push(`#### \`${name}\` object\n\n${renderPropertiesTable(variant, variant.required || [])}`)
        }
      }
    }
  }
  return blocks.filter(Boolean).join('\n\n')
}

function buildExampleFromSchema(schema, spec, depth = 0) {
  if (!schema || depth > 4) return undefined
  if (schema.$ref) return buildExampleFromSchema(resolveRef(schema.$ref, spec), spec, depth)
  if ('example' in schema) return schema.example
  if (schema.type === 'object' && schema.properties) {
    const obj = {}
    let hasAny = false
    for (const [k, v] of Object.entries(schema.properties)) {
      const val = buildExampleFromSchema(v, spec, depth + 1)
      if (val !== undefined) { obj[k] = val; hasAny = true }
    }
    return hasAny ? obj : undefined
  }
  if (schema.type === 'array' && schema.items) {
    const item = buildExampleFromSchema(schema.items, spec, depth + 1)
    return item !== undefined ? [item] : undefined
  }
  if (schema.enum) return schema.enum[0]
  return undefined
}

export function renderOpenApiMarkdown(title, method, apiPath, operation, spec) {
  const lines = [`# ${title}`, '', `**${method.toUpperCase()}** \`${apiPath}\``, '']

  if (operation?.description) lines.push(operation.description, '')
  if (operation?.operationId) lines.push(`- operationId: \`${operation.operationId}\``, '')

  const reqContent = operation?.requestBody?.content?.['application/json']
  if (reqContent?.schema) {
    const resolved = spec ? resolveSchema(reqContent.schema, spec) : reqContent.schema
    lines.push('## Request Body', '')
    if (resolved?.properties) {
      lines.push(renderPropertiesTable(resolved, resolved.required || []), '')
      const nested = renderNestedSchemas(resolved, spec)
      if (nested) lines.push(nested, '')
    }
  }

  if (reqContent?.example) {
    lines.push('### Request Example', '', '```json', JSON.stringify(reqContent.example, null, 2), '```', '')
  }

  const resp200 = operation?.responses?.['200']
  if (resp200) {
    lines.push('## Response', '')
    if (resp200.description) lines.push(resp200.description, '')
    const respContent = resp200.content?.['application/json']
    if (respContent?.schema && spec) {
      const resolved = resolveSchema(respContent.schema, spec)
      if (resolved?.properties) {
        lines.push(renderPropertiesTable(resolved, resolved.required || []), '')
        const nested = renderNestedSchemas(resolved, spec)
        if (nested) lines.push(nested, '')
      }

      const respExample = respContent.example || buildExampleFromSchema(resolved, spec)
      if (respExample) {
        lines.push('### Response Example', '', '```json', JSON.stringify(respExample, null, 2), '```', '')
      }
    }
  }

  return lines.join('\n').trim() + '\n'
}

export function renderOpenApiMdFromSource(raw, dashboardApiSpec) {
  const { meta, body } = extractFrontmatter(raw)
  if (body !== '<!-- Menu Mapping -->' || !meta.openapi) return null
  const hit = lookupOperation(dashboardApiSpec, meta.openapi)
  if (!hit) return null

  const frontmatter = ['---', `title: ${meta.title}`, `openapi: "${meta.openapi}"`, '---'].join('\n')
  return `${frontmatter}\n\n${renderOpenApiMarkdown(meta.title, hit.method, hit.apiPath, hit.operation, dashboardApiSpec)}`
}
