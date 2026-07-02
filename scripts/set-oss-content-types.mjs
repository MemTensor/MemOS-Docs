import { execFileSync, spawnSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { collectContentTypeManifest, llmsTxtFiles, writeContentTypeManifest, TEXT_PLAIN_UTF8 } from './oss-content-types.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')
const publicDir = path.join(repoRoot, '.output', 'public')
const sourcePublicDir = path.join(repoRoot, 'public')
const manifestPath = path.join(repoRoot, '.output', 'oss-content-types.json')

function resolveOssutil() {
  const candidates = [
    process.env.OSSUTIL_BIN,
    'ossutil64',
    'ossutil',
    '/usr/local/bin/ossutil64',
    '/usr/local/bin/ossutil'
  ].filter(Boolean)

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['version'], { encoding: 'utf8' })
    if (result.status === 0) return candidate
  }
  return null
}

function buildObjectUrl(bucket, prefix, objectPath) {
  const normalizedPrefix = prefix ? prefix.replace(/^\/+|\/+$/g, '') : ''
  const key = normalizedPrefix ? `${normalizedPrefix}/${objectPath}` : objectPath
  return `oss://${bucket}/${key}`
}

function setObjectMeta(ossutil, bucket, prefix, objectPath, contentType, dryRun) {
  const objectUrl = buildObjectUrl(bucket, prefix, objectPath)
  const args = ['set-meta', objectUrl, `Content-Type:${contentType}`, '-f']

  if (dryRun) {
    console.log(`[dry-run] ${ossutil} ${args.join(' ')}`)
    return true
  }

  try {
    execFileSync(ossutil, args, { stdio: 'pipe', encoding: 'utf8' })
    console.log(`✅ ${objectPath} -> ${contentType}`)
    return true
  } catch (error) {
    const stderr = error.stderr?.toString?.() || error.message
    console.error(`❌ ${objectPath}: ${stderr.trim()}`)
    return false
  }
}

function main() {
  if (!existsSync(publicDir)) {
    console.error('❌ .output/public not found. Run `pnpm run publish` first.')
    process.exit(1)
  }

  const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase())
  const bucket = process.env.OSS_BUCKET
  const prefix = process.env.OSS_PREFIX || ''
  const llmsOnly = ['1', 'true', 'yes'].includes(String(process.env.LLMS_ONLY || '0').toLowerCase())

  const objects = writeContentTypeManifest(publicDir, manifestPath)

  // Include files from source public/ that Nuxt generate may skip (dot-directories like .well-known/)
  if (existsSync(sourcePublicDir)) {
    for (const obj of collectContentTypeManifest(sourcePublicDir)) {
      if (!objects.find(o => o.path === obj.path)) {
        objects.push(obj)
      }
    }
  }

  const llmsObjects = llmsTxtFiles().map(name => ({ path: name, contentType: TEXT_PLAIN_UTF8 }))
  const targets = llmsOnly ? llmsObjects : objects

  console.log(`📝 Wrote manifest: ${manifestPath}`)
  console.log(`   ${objects.length} typed objects (${llmsObjects.length} llms*.txt)`)

  if (!bucket) {
    console.log('ℹ️  OSS_BUCKET not set — skipped remote metadata update.')
    console.log('   To apply on OSS after upload:')
    console.log('   OSS_BUCKET=your-bucket [OSS_PREFIX=path/to/site] pnpm run oss:meta')
    return
  }

  const ossutil = resolveOssutil()
  if (!ossutil) {
    console.error('❌ ossutil not found. Install Aliyun ossutil or set OSSUTIL_BIN.')
    console.error('   Manual fix for llms files:')
    for (const item of llmsObjects) {
      console.error(`   ossutil set-meta ${buildObjectUrl(bucket, prefix, item.path)} Content-Type:${item.contentType} -f`)
    }
    process.exit(1)
  }

  console.log(`🔧 Using ${ossutil} on oss://${bucket}/${prefix} (${dryRun ? 'dry-run' : 'live'})`)

  let ok = 0
  let failed = 0
  for (const item of targets) {
    const success = setObjectMeta(ossutil, bucket, prefix, item.path, item.contentType, dryRun)
    if (success) ok += 1
    else failed += 1
  }

  console.log(`Done: ${ok} updated, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main()
