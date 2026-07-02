import { defineEventHandler, getRequestURL, getHeader } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

function resolveMarkdownFile(slug: string): string | null {
  const contentDir = path.resolve(process.cwd(), 'content')
  const candidates = [
    path.join(contentDir, `${slug}.md`),
    path.join(contentDir, slug, 'index.md')
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
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
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Skip non-doc routes
  if (pathname.startsWith('/_') || pathname.startsWith('/api')) return

  let slug: string | null = null

  // Strategy 1: explicit .md suffix
  if (pathname.endsWith('.md') && pathname !== '/llms.txt' && pathname !== '/llms-full.txt') {
    slug = pathname.replace(/\.md$/, '')
  }

  // Strategy 2: Accept header negotiation
  if (!slug) {
    const accept = getHeader(event, 'accept') || ''
    if (isMarkdownPreferred(accept)) {
      slug = pathname.replace(/\/$/, '') || '/'
    }
  }

  if (!slug) return

  const filePath = resolveMarkdownFile(slug)
  if (!filePath) return

  const content = fs.readFileSync(filePath, 'utf-8')
  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Content-Source': 'llm-markdown'
    }
  })
})
