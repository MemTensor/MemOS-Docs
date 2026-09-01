import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { generateSitemapXml } from '../server/utils/llms-core.mjs'

const publicDir = fileURLToPath(new URL('../.output/public/', import.meta.url))
fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(new URL('../.output/public/sitemap.xml', import.meta.url), generateSitemapXml(), 'utf8')
console.log('Exported sitemap.xml')
