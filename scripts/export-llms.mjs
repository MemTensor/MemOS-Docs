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

// The root files cover both languages; /cn/ contains Chinese documentation only.
writeStaticLlmsFiles(path.join(publicDir, 'cn'), ['cn'])

console.log(`📋 Exported ${files.length} LLMs files: ${files.join(', ')} (plus Chinese versions in /cn/)`)
console.log(`   EN nav entries: ${countNavEntries('en')}`)
console.log(`   CN nav entries: ${countNavEntries('cn')}`)
