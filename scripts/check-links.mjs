import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from './link-check/config.mjs'
import { scanArtifacts } from './link-check/scan.mjs'
import { checkLinks } from './link-check/check.mjs'
import { printSummary, writeReports } from './link-check/report.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const options = {
  publicDir: path.join(root, '.output/public'),
  reportDir: path.join(root, '.output/reports/link-check'),
  config: path.join(root, 'scripts/check-links.config.json'),
  internalOnly: false
}

function parseArgs(args) {
  const paths = { '--public-dir': 'publicDir', '--report-dir': 'reportDir', '--config': 'config' }
  for (let i = 0; i < args.length; i++) {
    const [name, ...rest] = args[i].split('=')
    if (name === '--internal-only' && rest.length === 0) options.internalOnly = true
    else if (paths[name]) {
      const value = rest.length ? rest.join('=') : args[++i]
      if (!value || value.startsWith('--')) throw new Error(`参数 ${name} 缺少取值`)
      options[paths[name]] = path.resolve(value)
    } else throw new Error(`未知参数：${args[i]}`)
  }
  const relative = path.relative(options.publicDir, options.reportDir)
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('report-dir 必须位于 public-dir 之外，避免检查报告随站点发布')
  }
}

function commitId() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return process.env.COMMIT_SHA || 'unknown'
  }
}

if (process.argv.slice(2).includes('--help')) {
  console.log('用法：node scripts/check-links.mjs [--internal-only] [--public-dir PATH] [--report-dir PATH] [--config PATH]')
  console.log('退出码：0 = 无阻断错误；1 = 存在失效链接；2 = 配置无效或检查未完成。')
} else {
  let report
  try {
    parseArgs(process.argv.slice(2))
    const config = loadConfig(options.config)
    const artifacts = scanArtifacts(options.publicDir, config.siteUrl)
    console.log(`开始检查 ${artifacts.documents.length} 个文档（${options.internalOnly ? '仅检查站内链接' : '检查站内链接与外链'}）……`)
    let lastUpdate = Date.now()
    report = await checkLinks(artifacts, config, {
      internalOnly: options.internalOnly,
      onProgress(done, total) {
        if (Date.now() - lastUpdate >= 15000 || done === total) {
          console.log(`外链检查进度：${done}/${total}`)
          lastUpdate = Date.now()
        }
      }
    })
  } catch (error) {
    report = { schemaVersion: 1, checkedAt: new Date().toISOString(), mode: options.internalOnly ? 'internal-only' : 'all',
      complete: false, exitCode: 2, failure: `执行检查时发生异常：${error.message}`, results: [] }
  }
  report.commit = commitId()
  printSummary(report)
  try {
    const rel = path.relative(options.publicDir, options.reportDir)
    if (!rel || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel))) {
      throw new Error('拒绝将检查报告写入站点发布目录')
    }
    writeReports(report, options.reportDir)
    console.log(`完整检查报告：${path.join(options.reportDir, 'links.md')}`)
    console.log(`结构化检查结果：${path.join(options.reportDir, 'links.json')}`)
  } catch (error) {
    console.error(`无法写入检查报告：${error.message}`)
    report.exitCode = 2
  }
  process.exitCode = report.exitCode
}
