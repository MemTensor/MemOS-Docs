import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import crypto from 'crypto'

// --- Configuration ---
// Read target languages from external config
const languagesConfigPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'languages.json')
let TARGET_LANGS = ['en']
try {
  if (fs.existsSync(languagesConfigPath)) {
    TARGET_LANGS = JSON.parse(fs.readFileSync(languagesConfigPath, 'utf-8'))
  }
} catch (e) {
  console.warn('⚠️ Failed to read languages.json, defaulting to ["en"]', e)
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://api.deepseek.com'
const MODEL = process.env.OPENAI_MODEL || 'deepseek-chat'
const SOURCE_DIR = 'content/cn'

// --- Helpers ---

/**
 * Execute a shell command and return stdout
 */
function exec(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

/**
 * Get list of changed files in content/cn
 * If scripts/auto-translate.mjs changed, return ALL content files
 */
function getChangedFiles() {
  try {
    const output = exec('git diff --name-only HEAD^ HEAD')
    const changedFiles = output.split('\n').filter(Boolean)

    // If script itself changed, likely a config change (e.g. new language added).
    // Process ALL content files to ensure new language is generated.
    if (changedFiles.includes('scripts/languages.json')) {
      console.log('⚡️ Languages config changed, scanning all content files...')
      const allFiles = exec('git ls-files content/cn').split('\n')
      return allFiles.filter(line =>
        line.startsWith(SOURCE_DIR)
        && (line.endsWith('.md') || line.endsWith('settings.yml'))
      )
    }

    // Otherwise only process changed content files
    return changedFiles.filter(line =>
      line.startsWith(SOURCE_DIR)
      && (line.endsWith('.md') || line.endsWith('settings.yml'))
    )
  } catch (e) {
    console.error('Failed to get diff:', e)
    return []
  }
}

/**
 * Get file content from a specific git revision
 */
function getGitContent(revision, filePath) {
  try {
    return exec(`git show ${revision}:${filePath}`)
  } catch {
    return null
  }
}

/**
 * Generate MD5 hash of a string
 */
function getHash(str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

// --- Remark AST Logic ---

const processor = unified()
  .use(remarkParse)
  // Use '*' for bullets to match user preference and reduce diff noise
  .use(remarkStringify, { bullet: '*', fenc: '`' })
  .use(remarkFrontmatter, ['yaml'])

/**
 * Split AST tree into minimal independent blocks (Paragraphs, Headings, Lists, etc.)
 * Flatten the tree structure into a linear list of "translate units".
 */
function splitIntoBlocks(tree, rawContent) {
  const blocks = []

  // Helper to process nodes recursively or flatly
  function processNode(node, isLastInList = false, listSpread = false) {
    if (node.type === 'list') {
      // For Lists, iterate children (ListItems) and flatten them
      for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i]
        const isLastItem = i === node.children.length - 1
        processNode(item, isLastItem, node.spread)
      }
      return
    }

    // Determine separator
    // If it's a ListItem:
    //   - If it's the last item in the list, use '\n\n' (to separate from next block)
    //   - If list is loose (spread=true), use '\n\n'
    //   - Otherwise (tight list), use '\n'
    let separator = '\n\n'
    if (node.type === 'listItem') {
      if (isLastInList) {
        separator = '\n\n'
      } else {
        separator = listSpread ? '\n\n' : '\n'
      }
    }

    // Generate normalized text for hashing
    const tempRoot = { type: 'root', children: [node] }
    const normalizedText = processor.stringify(tempRoot).trim()

    // Get Raw Text for Output
    let rawText = normalizedText // Fallback
    if (rawContent && node.position) {
      rawText = rawContent.slice(node.position.start.offset, node.position.end.offset)
    }

    blocks.push({
      type: node.type,
      text: rawText,
      normalized: normalizedText,
      hash: getHash(normalizedText),
      separator: separator
    })
  }

  for (const node of tree.children) {
    processNode(node)
  }

  return blocks
}

// --- YAML Logic (Settings.yml) ---

function getYamlHeaderComments(source) {
  if (!source) return ''
  const lines = source.split('\n')
  const comments = []
  for (const line of lines) {
    if (line.trim().startsWith('#')) {
      comments.push(line)
    } else if (line.trim() === '') {
      continue
    } else {
      break
    }
  }
  return comments.join('\n') + (comments.length > 0 ? '\n' : '')
}

/**
 * Build a map of Hash(CNKey) -> [ENKey] from existing translations.
 * Traverses OldCN and OldEN in parallel.
 */
function buildYamlMap(cnNode, enNode, map) {
  if (!cnNode || !enNode) return

  if (Array.isArray(cnNode) && Array.isArray(enNode)) {
    const len = Math.min(cnNode.length, enNode.length)
    for (let i = 0; i < len; i++) {
      buildYamlMap(cnNode[i], enNode[i], map)
    }
  } else if (typeof cnNode === 'object' && cnNode !== null && typeof enNode === 'object' && enNode !== null) {
    const cnKeys = Object.keys(cnNode)
    const enKeys = Object.keys(enNode)

    // Assume structural alignment
    const len = Math.min(cnKeys.length, enKeys.length)
    for (let i = 0; i < len; i++) {
      const cnKey = cnKeys[i]
      const enKey = enKeys[i]
      const hash = getHash(cnKey)

      if (!map.has(hash)) {
        map.set(hash, [])
      }
      map.get(hash).push(enKey)

      buildYamlMap(cnNode[cnKey], enNode[enKey], map)
    }
  }
}

/**
 * Traverse NewCN and reconstruct NewEN using the map.
 * Collects missing keys for translation.
 */
function processYamlNode(node, map, collector) {
  if (Array.isArray(node)) {
    return node.map(item => processYamlNode(item, map, collector))
  } else if (typeof node === 'object' && node !== null) {
    const result = {}
    for (const key of Object.keys(node)) {
      const value = node[key]
      const hash = getHash(key)
      let finalKey = key

      if (map.has(hash) && map.get(hash).length > 0) {
        // Reuse existing translation (FIFO)
        finalKey = map.get(hash).shift()
      } else {
        // New key, needs translation.
        collector.push({ targetObj: result, originalKey: key })
      }

      result[finalKey] = processYamlNode(value, map, collector)
    }
    return result
  } else {
    return node
  }
}

// --- Translation Service ---

async function translateBatch(segments, targetLang) {
  if (segments.length === 0) return []

  console.log(`    ⏳ Translating ${segments.length} segments to ${targetLang}...`)

  const systemPrompt = `You are a professional technical documentation translator. 
  Translate the following segments from Chinese to ${targetLang}.
  
  Rules:
  1. PRESERVE all Markdown formatting (links, code blocks, bold, etc.).
  2. PRESERVE Frontmatter exactly if present.
  3. PRESERVE icon prefixes like "(ri:xxx) " exactly. Only translate the text after it.
  4. Return the result as a JSON array of strings, strictly matching the order of input.
  5. The output must be valid JSON. Raw JSON string only.`

  const userContent = JSON.stringify(segments)

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    let content = data.choices[0].message.content.trim()
    if (content.startsWith('```json')) content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    if (content.startsWith('```')) content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')

    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed) || parsed.length !== segments.length) {
      throw new Error('API returned mismatched array length')
    }
    return parsed
  } catch (error) {
    console.error('    ❌ Translation failed:', error.message)
    throw error
  }
}

// --- Main Processors ---

async function processMarkdownFile(filePath) {
  console.log(`\n📄 Processing Markdown: ${filePath}`)
  const newCNRaw = fs.readFileSync(filePath, 'utf-8')
  const oldCNRaw = getGitContent('HEAD^', filePath)

  // Parse AST
  const newTree = processor.parse(newCNRaw)
  const oldTree = oldCNRaw ? processor.parse(oldCNRaw) : { children: [] }

  const newBlocks = splitIntoBlocks(newTree, newCNRaw)
  const oldBlocks = splitIntoBlocks(oldTree, oldCNRaw)

  // --- Build Block Map (OldCN -> OldEN) ---
  // We need to map OldCN blocks to OldEN blocks to enable reuse.
  // Strategy: Assume sequential correspondence for identical blocks?
  // Or better: Build a Map<Hash, EnText>.
  // But Hash collision? (e.g. two "Note:" paragraphs).
  // We can use a queue/list for each hash to handle duplicates sequentially.

  const translationMap = new Map() // Hash -> [EnText1, EnText2, ...]

  for (const lang of TARGET_LANGS) {
    const targetPath = filePath.replace(SOURCE_DIR, `content/${lang}`)

    // Clear map for each language
    translationMap.clear()

    if (fs.existsSync(targetPath)) {
      const oldENRaw = fs.readFileSync(targetPath, 'utf-8')
      const oldENTree = processor.parse(oldENRaw)
      const oldENBlocks = splitIntoBlocks(oldENTree, oldENRaw)

      // Populate Map
      // Assumption: OldCN and OldEN structures are roughly aligned.
      // We try to match OldCN[i] with OldEN[i].
      // If OldCN and OldEN have different block counts (e.g. manual edit), alignment might be off.
      // But this is "Auto Translate", so usually they are synced.
      // Even if not perfectly synced, mapping by content hash is safer than index.
      // But we need to know WHICH OldCN block maps to WHICH OldEN block.
      // If we assume the translator generated them 1-to-1:

      const minLen = Math.min(oldBlocks.length, oldENBlocks.length)
      for (let i = 0; i < minLen; i++) {
        const cnHash = oldBlocks[i].hash
        const enText = oldENBlocks[i].text

        if (!translationMap.has(cnHash)) {
          translationMap.set(cnHash, [])
        }
        translationMap.get(cnHash).push(enText)
      }
    }

    // --- Reconstruct New File ---
    const segmentsToTranslate = []
    const segmentIndices = []
    const finalBlocks = new Array(newBlocks.length).fill(null)

    // Helper to consume from map
    // We clone the map or track indices to avoid reusing same translation for different identical source blocks incorrectly?
    // Actually, simple FIFO is good for identical blocks.
    const tempMap = new Map(JSON.parse(JSON.stringify([...translationMap])))

    for (let i = 0; i < newBlocks.length; i++) {
      const block = newBlocks[i]
      const hash = block.hash

      if (tempMap.has(hash) && tempMap.get(hash).length > 0) {
        // Reuse existing translation
        // Shift ensures we use the first available translation for this hash, preserving order
        const enText = tempMap.get(hash).shift()
        finalBlocks[i] = enText
      } else {
        // New or Changed Block
        segmentsToTranslate.push(block.text)
        segmentIndices.push(i)
      }
    }

    if (segmentsToTranslate.length > 0) {
      console.log(`    Need to translate ${segmentsToTranslate.length} blocks for [${lang}]`)
      const translated = await translateBatch(segmentsToTranslate, lang)
      translated.forEach((trans, idx) => {
        finalBlocks[segmentIndices[idx]] = trans
      })
    } else {
      console.log(`    ✨ No changes for [${lang}]`)
    }

    const targetDir = path.dirname(targetPath)
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

    // Join blocks with dynamic separators
    let finalContent = ''
    for (let i = 0; i < finalBlocks.length; i++) {
      const block = newBlocks[i]
      const content = finalBlocks[i]
      // Use block.separator if available, default to '\n\n'
      const separator = block.separator || '\n\n'

      finalContent += content
      // Don't add separator after the very last block?
      // Usually Markdown files end with a newline, so adding it is fine/good.
      if (i < finalBlocks.length - 1) {
        finalContent += separator
      } else {
        finalContent += '\n' // Ensure EOF newline
      }
    }

    fs.writeFileSync(targetPath, finalContent, 'utf-8')
    console.log(`    ✅ Updated: ${targetPath}`)
  }
}

async function processYamlFile(filePath) {
  console.log(`\n⚙️ Processing YAML: ${filePath}`)
  const newCNRaw = fs.readFileSync(filePath, 'utf-8')
  const oldCNRaw = getGitContent('HEAD^', filePath)

  const newCN = yaml.load(newCNRaw)
  const oldCN = oldCNRaw ? yaml.load(oldCNRaw) : null
  const headerComments = getYamlHeaderComments(newCNRaw)

  for (const lang of TARGET_LANGS) {
    const targetPath = filePath.replace(SOURCE_DIR, `content/${lang}`)

    // 1. Build Map from OldCN + OldEN
    const translationMap = new Map()
    if (oldCN && fs.existsSync(targetPath)) {
      const oldEN = yaml.load(fs.readFileSync(targetPath, 'utf-8'))
      buildYamlMap(oldCN, oldEN, translationMap)
    }

    // 2. Process NewCN with Map
    const collector = []
    const finalObj = processYamlNode(newCN, translationMap, collector)

    if (collector.length > 0) {
      console.log(`    Need to translate ${collector.length} keys for [${lang}]`)
      const textsToTranslate = collector.map(item => item.originalKey)
      const translatedTexts = await translateBatch(textsToTranslate, lang)

      collector.forEach((item, idx) => {
        const transKey = translatedTexts[idx]
        const val = item.targetObj[item.originalKey]
        delete item.targetObj[item.originalKey]
        item.targetObj[transKey] = val
      })
    } else {
      console.log(`    ✨ No changes for [${lang}]`)
    }

    const targetDir = path.dirname(targetPath)
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

    const yamlStr = yaml.dump(finalObj, { lineWidth: -1, noRefs: true })
    fs.writeFileSync(targetPath, headerComments + yamlStr, 'utf-8')
    console.log(`    ✅ Updated: ${targetPath}`)
  }
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY is not set.')
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const targetArg = args.find(arg => arg.startsWith('--target='))
  if (targetArg) {
    const targets = targetArg.split('=')[1].split(',')
    TARGET_LANGS.length = 0
    TARGET_LANGS.push(...targets)
  }

  const files = getChangedFiles()

  if (files.length === 0) {
    console.log('No relevant files changed in content/cn.')
    return
  }

  console.log(`Found ${files.length} changed files.`)

  for (const file of files) {
    try {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        await processYamlFile(file)
      } else {
        await processMarkdownFile(file)
      }
    } catch (e) {
      console.error(`Failed to process ${file}:`, e)
    }
  }
}

main()
