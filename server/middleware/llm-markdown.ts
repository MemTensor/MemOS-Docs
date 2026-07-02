import { defineEventHandler, getRequestURL, getHeader } from 'h3'
import fs from 'node:fs'
import path from 'node:path'
import { renderOpenApiMdFromSource, stripNuxtComponents, generateLlmsTxt, generateLlmsFullTxt } from '../utils/llms-core.mjs'

const contentDir = path.resolve(process.cwd(), 'content')
const hasContent = fs.existsSync(path.join(contentDir, 'en', 'settings.yml'))

function resolveMarkdownFile(slug: string): string | null {
  const candidates = [
    path.join(contentDir, `${slug}.md`),
    path.join(contentDir, slug, 'index.md'),
    path.join(contentDir, 'en', `${slug}.md`),
    path.join(contentDir, 'en', slug, 'index.md'),
    path.join(contentDir, 'cn', `${slug}.md`),
    path.join(contentDir, 'cn', slug, 'index.md')
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function resolveDashboardApiSpec(slug: string) {
  const specCandidates = [
    path.join(contentDir, 'cn', 'api_docs', 'api.json'),
    path.join(contentDir, 'en', 'api_docs', 'api.json')
  ]

  if (slug.startsWith('cn/')) {
    const specPath = specCandidates[0]
    return fs.existsSync(specPath) ? JSON.parse(fs.readFileSync(specPath, 'utf8')) : null
  }

  for (const specPath of specCandidates) {
    if (fs.existsSync(specPath)) return JSON.parse(fs.readFileSync(specPath, 'utf8'))
  }
  return null
}

function isMarkdownPreferred(accept: string): boolean {
  if (!accept) return false
  const types = accept.split(',').map(t => t.split(';')[0].trim().toLowerCase())
  const mdIndex = types.findIndex(t => t === 'text/markdown' || t === 'text/x-markdown')
  const htmlIndex = types.findIndex(t => t === 'text/html' || t === '*/*')
  if (mdIndex === -1) return false
  if (htmlIndex === -1) return true
  return mdIndex < htmlIndex
}

export default defineEventHandler((event) => {
  if (!hasContent) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (pathname.startsWith('/_') || (pathname.startsWith('/api/') && !pathname.startsWith('/api_docs'))) return

  // Serve llms.txt dynamically in dev (in production, static files from export-llms.mjs are used)
  if (pathname === '/llms.txt' || pathname === '/cn/llms.txt') {
    return new Response(generateLlmsTxt(), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
  if (pathname === '/llms-full.txt' || pathname === '/cn/llms-full.txt') {
    return new Response(generateLlmsFullTxt(), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }

  // Serve .md files
  let slug: string | null = null

  if (pathname.endsWith('.md') && !pathname.includes('llms')) {
    slug = pathname.replace(/^\//, '').replace(/\.md$/, '')
  }

  if (!slug) {
    const accept = getHeader(event, 'accept') || ''
    if (isMarkdownPreferred(accept)) {
      slug = pathname.replace(/^\//, '').replace(/\/$/, '') || ''
    }
  }

  if (!slug) return

  const filePath = resolveMarkdownFile(slug)
  if (!filePath) return

  const raw = fs.readFileSync(filePath, 'utf8')
  const dashboardApiSpec = resolveDashboardApiSpec(slug)
  const generated = renderOpenApiMdFromSource(raw, dashboardApiSpec)
  const body = generated || stripNuxtComponents(raw)

  const directive = '> For the complete documentation index, see [llms.txt](/llms.txt)\n\n'
  const content = directive + body

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Content-Source': generated ? 'llm-openapi' : 'llm-markdown'
    }
  })
})
