import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Parse command line arguments
const parseArgs = (args) => {
  const result = {}
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      result[key] = value
    }
  })
  return result
}

// Get environment parameters from npm config or command line arguments
const args = parseArgs(process.argv.slice(2))
const env = args.env || process.env.npm_config_env || 'prod'
const locale = args.locale || process.env.npm_config_locale || 'en'

console.log(`🚀 Starting build process... Environment: ${env}, Locale: ${locale}`)

// Check environment config
console.log('⚙️ Configuring environment variables...')
const configPath = join(__dirname, '..', 'envConfig', `config.${env}.ts`)
if (existsSync(configPath)) {
  console.log(`✅ Environment config detected: config.${env}.ts`)
} else {
  console.log(`⚠️ Warning: Environment config file config.${env}.ts not found, using default config`)
}

// Build documentation
console.log('🏗️ Starting documentation build...')
try {
  const nodeHeapMb = process.env.NODE_HEAP_MB || '6144'
  const nuxtBin = join(__dirname, '..', 'node_modules', 'nuxt', 'bin', 'nuxt.mjs')
  const buildEnv = {
    ...process.env,
    NUXT_ENV_CONFIG: env,
    NUXT_PUBLIC_LOCALE: locale,
    NODE_OPTIONS: `--max-old-space-size=${nodeHeapMb}`
  }

  console.log(`🧠 Node heap limit: ${nodeHeapMb}MB`)

  execSync(`node --max-old-space-size=${nodeHeapMb} "${nuxtBin}" generate`, {
    stdio: 'inherit',
    env: buildEnv
  })

  execSync('node scripts/export-markdown.mjs', {
    stdio: 'inherit',
    env: { ...process.env }
  })

  execSync('node scripts/export-llms.mjs', {
    stdio: 'inherit',
    env: { ...process.env }
  })

  if (process.env.OSS_BUCKET) {
    console.log('🔧 Applying OSS Content-Type metadata...')
    execSync('node scripts/set-oss-content-types.mjs', {
      stdio: 'inherit',
      env: { ...process.env }
    })
  }

  console.log('✨ Build process completed!')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}
