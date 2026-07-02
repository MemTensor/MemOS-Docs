import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { writeStaticLlmsFiles, countNavEntries } from '../server/utils/llms-core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', '.output', 'public')

if (!existsSync(publicDir)) {
  console.error('❌ LLMs export failed: .output/public does not exist. Run nuxt generate first.')
  process.exit(1)
}

const files = writeStaticLlmsFiles(publicDir)

// Copy llms.txt and llms-full.txt to /cn/ so agents entering via the Chinese locale can discover them
const cnDir = path.join(publicDir, 'cn')
fs.mkdirSync(cnDir, { recursive: true })
for (const name of files) {
  fs.copyFileSync(path.join(publicDir, name), path.join(cnDir, name))
}

console.log(`📋 Exported ${files.length} LLMs files: ${files.join(', ')} (also mirrored to /cn/)`)
console.log(`   EN nav entries: ${countNavEntries('en')}`)
