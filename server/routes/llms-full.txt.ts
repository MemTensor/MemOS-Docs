import { defineEventHandler } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '')
}

function extractTitle(content: string): string {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return ''
  return match[1].match(/^title:\s*(.+)$/m)?.[1]?.trim() || ''
}

function walkAndConcat(dir: string, baseUrl: string, relativeTo: string): string[] {
  const pages: string[] = []
  if (!fs.existsSync(dir)) return pages

  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      pages.push(...walkAndConcat(fullPath, baseUrl, relativeTo))
    } else if (item.name.endsWith('.md')) {
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const title = extractTitle(raw)
      if (!title) continue

      const relPath = path.relative(relativeTo, fullPath)
        .replace(/\.md$/, '')
        .replace(/\/index$/, '')
      const url = `${baseUrl}/${relPath}`
      const body = stripFrontmatter(raw).trim()
      if (!body || body === '<!-- Menu Mapping -->') continue

      pages.push(`# ${title} (${url})\n\n${body}`)
    }
  }
  return pages
}

export default defineEventHandler(() => {
  const contentDir = path.resolve(process.cwd(), 'content')

  const cnPages = walkAndConcat(
    path.join(contentDir, 'cn'),
    '/cn',
    path.join(contentDir, 'cn')
  )
  const enPages = walkAndConcat(
    path.join(contentDir, 'en'),
    '',
    path.join(contentDir, 'en')
  )

  const allPages = [...cnPages, ...enPages]
  const output = allPages.join('\n\n---\n\n')

  return new Response(output, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
})
