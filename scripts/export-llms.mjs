import path from 'path'
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
console.log(`📋 Exported ${files.length} LLMs files: ${files.join(', ')}`)
console.log(`   EN nav entries: ${countNavEntries('en')}`)
