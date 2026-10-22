import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse, parseFragment } from 'parse5'
import parseSrcset from 'parse-srcset'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

const markdown = unified().use(remarkParse).use(remarkGfm)
const resources = {
  img: ['src', 'srcset'], source: ['src', 'srcset'], video: ['src', 'poster'],
  audio: ['src'], iframe: ['src'], embed: ['src'], object: ['data']
}

function visit(node, fn, insideExample = false) {
  const skipLinks = insideExample || ['pre', 'code', 'script', 'style'].includes(node.tagName)
  fn(node, skipLinks)
  for (const child of node.childNodes || []) visit(child, fn, skipLinks)
  if (node.content) visit(node.content, fn, skipLinks)
}

function htmlDetails(tree, source, lineOffset = 0, columnOffset = 0) {
  const ids = new Set()
  const links = []
  let baseHref
  let redirect
  visit(tree, (node, skipLinks) => {
    const attrs = Object.fromEntries((node.attrs || []).map(attr => [attr.name, attr.value]))
    if (attrs.id) ids.add(attrs.id)
    if (node.tagName === 'a' && attrs.name) ids.add(attrs.name)
    if (skipLinks) return
    if (node.tagName === 'base' && baseHref === undefined && attrs.href !== undefined) baseHref = attrs.href
    const names = node.tagName === 'a' || node.tagName === 'area'
      ? ['href']
      : node.tagName === 'input' && attrs.type === 'image' ? ['src'] : (resources[node.tagName] || [])
    for (const name of names) {
      if (attrs[name] === undefined) continue
      const loc = node.sourceCodeLocation?.attrs?.[name]
      const urls = name === 'srcset' ? parseSrcset(attrs[name]).map(candidate => candidate.url) : [attrs[name]]
      for (const url of urls) {
        links.push({ url, attribute: name, line: (loc?.startLine || 1) + lineOffset,
          column: (loc?.startCol || 1) + ((loc?.startLine || 1) === 1 ? columnOffset : 0),
          context: source.slice(node.sourceCodeLocation?.startOffset || 0, node.sourceCodeLocation?.startTag?.endOffset || 160).slice(0, 200) })
      }
    }
    if (node.tagName === 'meta' && attrs['http-equiv']?.toLowerCase() === 'refresh') {
      const match = attrs.content?.match(/^\s*[\d.]+\s*;\s*url\s*=\s*([\s\S]+)$/i)
      if (match) {
        redirect = match[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2')
        links.push({ url: redirect, attribute: 'refresh', line: (node.sourceCodeLocation?.startLine || 1) + lineOffset, column: 1 })
      }
    }
  })
  return { ids, links, baseHref, redirect }
}

export function parseHtml(source) {
  return htmlDetails(parse(source, { sourceCodeLocationInfo: true }), source)
}

export function parseMarkdown(source) {
  // Mask frontmatter without shifting source positions. Its rendered links are checked in HTML.
  const masked = source.replace(/^\uFEFF/, ' ').replace(/^ ?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, block => block.replace(/[^\r\n]/g, ' '))
  const tree = markdown.parse(masked)
  const definitions = new Map()
  const links = []
  function walk(node, fn) {
    if (node.type === 'code' || node.type === 'inlineCode') return
    fn(node)
    for (const child of node.children || []) walk(child, fn)
  }
  walk(tree, (node) => {
    if (node.type === 'definition') definitions.set(node.identifier, node.url)
  })
  walk(tree, (node) => {
    let url
    if (node.type === 'link' || node.type === 'image') url = node.url
    if (node.type === 'linkReference' || node.type === 'imageReference') url = definitions.get(node.identifier)
    if (url !== undefined) links.push({ url, attribute: node.type, line: node.position.start.line,
      column: node.position.start.column, context: source.slice(node.position.start.offset, node.position.end.offset).slice(0, 200) })
    if (node.type === 'html') {
      const details = htmlDetails(parseFragment(node.value, { sourceCodeLocationInfo: true }), node.value,
        node.position.start.line - 1, node.position.start.column - 1)
      links.push(...details.links)
    }
  })
  return { links, ids: new Set() }
}

export function scanArtifacts(publicDir, siteUrl) {
  const files = new Set()
  const documents = []
  function walk(dir, prefix = '') {
    for (const item of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = `${prefix}${item.name}`
      if (item.isSymbolicLink()) throw new Error(`构建产物包含不支持的符号链接：${relative}`)
      if (item.isDirectory()) walk(path.join(dir, item.name), `${relative}/`)
      else if (item.isFile()) files.add(relative)
    }
  }
  walk(publicDir)
  for (const file of files) {
    const isHtml = file.endsWith('.html')
    const isMarkdown = file.endsWith('.md')
    const isLlms = /(^|\/)llms(?:-full)?\.txt$/.test(file)
    if ((!isHtml && !isMarkdown && !isLlms) || file.startsWith('_nuxt/')) continue
    const source = readFileSync(path.join(publicDir, file), 'utf8')
    const details = isHtml ? parseHtml(source) : parseMarkdown(source)
    const pathname = isHtml && /(^|\/)index\.html$/.test(file)
      ? `/${file.slice(0, -'index.html'.length)}`
      : `/${file}`
    const pageUrl = new URL(pathname, siteUrl).href
    const baseUrl = details.baseHref === undefined ? pageUrl : new URL(details.baseHref, pageUrl).href
    documents.push({ file, pathname, pageUrl, baseUrl, kind: isHtml ? 'html' : isMarkdown ? 'markdown' : 'llms', ...details })
  }
  if (!documents.some(doc => doc.kind === 'html')) throw new Error('未找到 HTML 文档，请先执行 pnpm run publish 再检查链接。')
  const byFile = new Map(documents.map(doc => [doc.file, doc]))
  const routes = new Map()
  for (const file of files) routes.set(`/${file}`, file)
  for (const doc of documents.filter(doc => doc.kind === 'html')) {
    if (/(^|\/)index\.html$/.test(doc.file)) {
      routes.set(doc.pathname, doc.file)
      routes.set(doc.pathname.replace(/\/$/, '') || '/', doc.file)
    } else {
      const alias = `/${doc.file.slice(0, -5)}`
      if (!routes.has(alias)) routes.set(alias, doc.file)
    }
  }
  return { files, documents, routes, byFile }
}
