import { defineEventHandler } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

interface DocEntry {
  title: string
  desc: string
  url: string
}

function extractFrontmatter(content: string): { title: string; desc: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { title: '', desc: '' }
  const fm = match[1]
  const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim() || ''
  const desc = fm.match(/^desc:\s*(.+)$/m)?.[1]?.trim() || ''
  return { title, desc }
}

function walkMdFiles(dir: string, baseUrl: string, relativeTo: string): DocEntry[] {
  const entries: DocEntry[] = []
  if (!fs.existsSync(dir)) return entries

  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      entries.push(...walkMdFiles(fullPath, baseUrl, relativeTo))
    } else if (item.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      const { title, desc } = extractFrontmatter(content)
      if (!title) continue

      const body = content.replace(/^---\n[\s\S]*?\n---\n*/, '').trim()
      if (!body || body === '<!-- Menu Mapping -->') continue

      const relPath = path.relative(relativeTo, fullPath)
        .replace(/\.md$/, '')
        .replace(/\/index$/, '')
      const url = `${baseUrl}/${relPath}`
      entries.push({ title, desc, url })
    }
  }
  return entries
}

export default defineEventHandler(() => {
  const contentDir = path.resolve(process.cwd(), 'content')

  const cnEntries = walkMdFiles(
    path.join(contentDir, 'cn'),
    '/cn',
    path.join(contentDir, 'cn')
  )
  const enEntries = walkMdFiles(
    path.join(contentDir, 'en'),
    '',
    path.join(contentDir, 'en')
  )

  let output = '# MemOS Documentation\n\n'
  output += '> MemOS is a long-term memory system for AI agents and applications.\n'
  output += '> To get raw Markdown of any page, append .md to its URL or request with Accept: text/markdown header.\n'
  output += '> Full documentation text: /llms-full.txt\n\n'

  if (cnEntries.length) {
    output += '## 中文文档\n\n'
    for (const entry of cnEntries) {
      output += `- [${entry.title}](${entry.url})`
      if (entry.desc) output += `: ${entry.desc}`
      output += '\n'
    }
    output += '\n'
  }

  if (enEntries.length) {
    output += '## English Documentation\n\n'
    for (const entry of enEntries) {
      output += `- [${entry.title}](${entry.url})`
      if (entry.desc) output += `: ${entry.desc}`
      output += '\n'
    }
  }

  return new Response(output, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
})
