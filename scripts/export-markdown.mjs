import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { renderOpenApiMarkdown, renderOpenApiMdFromSource, stripNuxtComponents } from '../server/utils/llms-core.mjs'

const MD_DIRECTIVE = '> For the complete documentation index, see [llms.txt](/llms.txt)\n\n'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = join(__dirname, '..')
const publicDir = join(repoRoot, '.output', 'public')

const locales = [
  {
    sourceDir: join(repoRoot, 'content', 'cn'),
    outputDir: join(publicDir, 'cn'),
    dashboardApiSpecPath: join(repoRoot, 'content', 'cn', 'api_docs', 'api.json')
  },
  {
    sourceDir: join(repoRoot, 'content', 'en'),
    outputDir: publicDir,
    dashboardApiSpecPath: join(repoRoot, 'content', 'en', 'api_docs', 'api.json')
  }
]

function copyMarkdownFiles(sourceDir, outputDir, dashboardApiSpec, currentDir = sourceDir) {
  let count = 0
  let apiGenerated = 0

  for (const item of readdirSync(currentDir)) {
    const sourcePath = join(currentDir, item)
    const stats = statSync(sourcePath)

    if (stats.isDirectory()) {
      const nested = copyMarkdownFiles(sourceDir, outputDir, dashboardApiSpec, sourcePath)
      count += nested.count
      apiGenerated += nested.apiGenerated
      continue
    }

    if (!stats.isFile() || !item.endsWith('.md')) continue

    const outputPath = join(outputDir, relative(sourceDir, sourcePath))
    mkdirSync(dirname(outputPath), { recursive: true })

    const raw = readFileSync(sourcePath, 'utf8')
    const generated = renderOpenApiMdFromSource(raw, dashboardApiSpec)
    if (generated) {
      writeFileSync(outputPath, MD_DIRECTIVE + generated, 'utf8')
      apiGenerated += 1
    } else {
      writeFileSync(outputPath, MD_DIRECTIVE + stripNuxtComponents(raw), 'utf8')
    }
    count += 1
  }

  return { count, apiGenerated }
}

if (!existsSync(publicDir)) {
  console.error('❌ Markdown export failed: .output/public does not exist. Run nuxt generate first.')
  process.exit(1)
}

// Generate .md for /api-reference/* pages (Product API from content/api.json)
function exportApiReferenceMarkdown() {
  const specPath = join(repoRoot, 'content', 'api.json')
  if (!existsSync(specPath)) return 0
  const spec = JSON.parse(readFileSync(specPath, 'utf8'))
  if (!spec?.paths) return 0

  let count = 0
  for (const [apiPath, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue
      if (!operation.summary) continue
      const slug = operation.summary.split(' ').map(p => p.toLowerCase()).join('-')
      const outputPath = join(publicDir, 'api-reference', slug + '.md')
      mkdirSync(dirname(outputPath), { recursive: true })
      const md = renderOpenApiMarkdown(operation.summary, method, apiPath, operation, spec)
      writeFileSync(outputPath, MD_DIRECTIVE + md, 'utf8')
      count++
    }
  }
  return count
}

const apiRefCount = exportApiReferenceMarkdown()

let total = 0
let apiGenerated = 0
for (const { sourceDir, outputDir, dashboardApiSpecPath } of locales) {
  if (!existsSync(sourceDir)) continue
  const dashboardApiSpec = existsSync(dashboardApiSpecPath)
    ? JSON.parse(readFileSync(dashboardApiSpecPath, 'utf8'))
    : null
  const result = copyMarkdownFiles(sourceDir, outputDir, dashboardApiSpec)
  total += result.count
  apiGenerated += result.apiGenerated
}

console.log(`📄 Exported ${total} Markdown files to .output/public (${apiGenerated} OpenAPI pages expanded, ${apiRefCount} API Reference pages generated)`)
