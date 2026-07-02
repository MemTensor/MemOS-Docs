import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = join(__dirname, '..')
const publicDir = join(repoRoot, '.output', 'public')

const locales = [
  {
    sourceDir: join(repoRoot, 'content', 'cn'),
    outputDir: join(publicDir, 'cn')
  },
  {
    sourceDir: join(repoRoot, 'content', 'en'),
    outputDir: publicDir
  }
]

function copyMarkdownFiles(sourceDir, outputDir, currentDir = sourceDir) {
  let count = 0

  for (const item of readdirSync(currentDir)) {
    const sourcePath = join(currentDir, item)
    const stats = statSync(sourcePath)

    if (stats.isDirectory()) {
      count += copyMarkdownFiles(sourceDir, outputDir, sourcePath)
      continue
    }

    if (!stats.isFile() || !item.endsWith('.md')) continue

    const outputPath = join(outputDir, relative(sourceDir, sourcePath))
    mkdirSync(dirname(outputPath), { recursive: true })
    copyFileSync(sourcePath, outputPath)
    count += 1
  }

  return count
}

if (!existsSync(publicDir)) {
  console.error('❌ Markdown export failed: .output/public does not exist. Run nuxt generate first.')
  process.exit(1)
}

let total = 0
for (const { sourceDir, outputDir } of locales) {
  if (!existsSync(sourceDir)) continue
  total += copyMarkdownFiles(sourceDir, outputDir)
}

console.log(`📄 Exported ${total} Markdown files to .output/public`)
