import { existsSync, readdirSync, statSync, writeFileSync } from 'fs'
import path from 'path'

export const TEXT_PLAIN_UTF8 = 'text/plain; charset=utf-8'
export const TEXT_MARKDOWN_UTF8 = 'text/markdown; charset=utf-8'

const LLMS_TXT_PATTERN = /^llms(-cn|-en)?(-full)?\.txt$/

export const APPLICATION_JSON_UTF8 = 'application/json; charset=utf-8'

export function contentTypeFor(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/')
  const basename = path.posix.basename(normalized)

  if (LLMS_TXT_PATTERN.test(basename)) {
    return TEXT_PLAIN_UTF8
  }

  if (normalized.endsWith('.md')) {
    return TEXT_MARKDOWN_UTF8
  }

  // .well-known discovery files served as JSON
  if (normalized === '.well-known/mcp' || normalized === '.well-known/mcp.json') {
    return APPLICATION_JSON_UTF8
  }

  return null
}

function walkFiles(dir, relativeTo, entries = []) {
  for (const item of readdirSync(dir)) {
    const fullPath = path.join(dir, item)
    const stats = statSync(fullPath)
    const relativePath = path.relative(relativeTo, fullPath).replace(/\\/g, '/')

    if (stats.isDirectory()) {
      walkFiles(fullPath, relativeTo, entries)
      continue
    }

    const contentType = contentTypeFor(relativePath)
    if (contentType) {
      entries.push({ path: relativePath, contentType })
    }
  }
  return entries
}

export function collectContentTypeManifest(publicDir) {
  if (!existsSync(publicDir)) return []
  return walkFiles(publicDir, publicDir).sort((a, b) => a.path.localeCompare(b.path))
}

export function writeContentTypeManifest(publicDir, manifestPath) {
  const objects = collectContentTypeManifest(publicDir)
  writeFileSync(manifestPath, `${JSON.stringify({ objects }, null, 2)}\n`, 'utf8')
  return objects
}

export function llmsTxtFiles() {
  return [
    'llms.txt',
    'llms-full.txt'
  ]
}
