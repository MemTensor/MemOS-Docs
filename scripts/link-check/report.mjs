import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

function cell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const issueLabels = {
  MISSING_FILE: '目标页面或资源不存在',
  MISSING_ANCHOR: '目标锚点不存在',
  INVALID_URL: '链接格式或编码无效',
  REDIRECT_LOOP: '循环重定向',
  TOO_MANY_REDIRECTS: '重定向次数超出上限',
  INVALID_REDIRECT: '重定向地址无效',
  UNSUPPORTED_REDIRECT: '重定向协议不支持检查',
  UNVERIFIABLE_REDIRECT: '重定向目标无法验证',
  REDIRECT_WITHOUT_LOCATION: '重定向响应缺少目标地址',
  HTTP_BROKEN: '外链确认失效',
  HTTP_UNVERIFIED: '外链需要进一步确认',
  NETWORK_ERROR: '网络请求失败',
  REQUEST_TIMEOUT: '单次请求超时',
  CHECK_TIMEOUT: '整轮检查超时',
  TEXT_FRAGMENT_UNVERIFIED: '文本片段需要浏览器验证',
  NON_HTML_FRAGMENT: '非 HTML 文件的锚点需要确认',
  UNSUPPORTED_PROTOCOL: '链接协议不支持检查',
  URL_CREDENTIALS: '链接包含登录凭据',
  MIXED_REDIRECT_CHAIN: '混合重定向链需要确认',
  EXCEPTION: '已配置临时例外',
  NON_HTTP: '跳过非 HTTP 链接',
  EXAMPLE_URL: '跳过本地服务或示例地址',
  EXTERNAL_DISABLED: '本轮未执行外链检查',
  INTERNAL_OK: '站内目标验证通过',
  HTTP_OK: '外链可访问'
}

function describeResult(result) {
  switch (result.code) {
    case 'MISSING_FILE': return '本次构建产物中不存在该链接指向的页面或资源。'
    case 'MISSING_ANCHOR': return `目标 HTML 中不存在链接指定的锚点。${result.file ? `目标文件：${result.file}。` : ''}`
    case 'INVALID_URL': return '链接格式或 URL 编码无效，无法正确解析目标地址。'
    case 'REDIRECT_LOOP': return '检测到循环重定向，无法到达有效目标。'
    case 'TOO_MANY_REDIRECTS': return '重定向次数超过配置上限，无法确认最终目标。'
    case 'INVALID_REDIRECT': return 'HTTP Location 或 HTML refresh 中的目标地址无效。'
    case 'UNSUPPORTED_REDIRECT': return '重定向指向非 HTTP(S) 协议，需要人工确认。'
    case 'UNVERIFIABLE_REDIRECT': return '重定向指向本地服务、示例域名或含登录凭据的地址，需要人工确认。'
    case 'REDIRECT_WITHOUT_LOCATION': return '服务器返回重定向响应，但未提供 Location 目标地址。'
    case 'HTTP_BROKEN': return `GET 复核返回 HTTP ${result.statusCode}，该链接无法正常访问。`
    case 'HTTP_UNVERIFIED': return `返回 HTTP ${result.statusCode}，可能需要登录、受到访问限制或暂时不可用，请进一步确认。`
    case 'NETWORK_ERROR': return `网络请求失败，需要进一步确认。原始诊断：${result.message || '未知网络错误'}`
    case 'REQUEST_TIMEOUT': return '单次 HTTP 请求超过配置时限，重试后仍未完成验证。'
    case 'CHECK_TIMEOUT': return '整轮外链检查超过配置时限，该目标未完成验证。'
    case 'TEXT_FRAGMENT_UNVERIFIED': return '文本片段链接需要通过浏览器验证，本轮未确认其有效性。'
    case 'NON_HTML_FRAGMENT': return 'Markdown、纯文本或二进制资源的锚点依赖具体阅读器，需要人工确认。'
    case 'UNSUPPORTED_PROTOCOL': return '当前检查器仅探测 HTTP(S) 资源，该协议需要人工确认。'
    case 'URL_CREDENTIALS': return '链接包含登录凭据，未自动请求，需要人工确认。'
    case 'MIXED_REDIRECT_CHAIN': return '链接同时经过 HTTP 跳转和站内 HTML refresh 跳转，需要进一步确认完整路径。'
    case 'EXCEPTION': return result.message
    case 'NON_HTTP': return '该链接使用非 HTTP 协议，按规则跳过网络检查。'
    case 'EXAMPLE_URL': return '该地址属于本地服务或配置中明确指定的示例域名，按规则跳过。'
    case 'EXTERNAL_DISABLED': return '本轮使用 --internal-only，仅检查站内链接，未探测该外链。'
    case 'INTERNAL_OK': return '本次构建产物中存在目标资源，适用的 HTML 锚点检查已通过。'
    case 'HTTP_OK': return `外链可访问，返回 HTTP ${result.statusCode}。`
    default: return result.message || '请结合错误代码和引用位置进一步确认。'
  }
}

function localizeReport(report) {
  if (report.language === 'zh-CN') return report
  return { ...report, language: 'zh-CN', results: report.results.map(result => ({ ...result, message: describeResult(result) })) }
}

function modeLabel(mode) {
  return mode === 'internal-only' ? '仅检查站内链接（外链未验证）' : '完整检查（站内链接与外链）'
}

function formatTime(value) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  return `${new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).format(date)}（北京时间，UTC+08:00）`
}

export function writeReports(input, reportDir) {
  const report = localizeReport(input)
  mkdirSync(reportDir, { recursive: true })
  writeFileSync(path.join(reportDir, 'links.json'), JSON.stringify(report, null, 2) + '\n')
  const s = report.summary
  const lines = ['# 文档链接完整检查报告', '',
    `- 提交标识：${cell(report.commit && report.commit !== 'unknown' ? report.commit : '未知')}`,
    `- 检查时间：${cell(formatTime(report.checkedAt))}`,
    `- 检查范围：${modeLabel(report.mode)}`,
    `- 检查是否完成：${report.complete ? '已完成所选范围的检查' : '未完成，必须停止部署'}`,
    `- 退出码：${report.exitCode}（0：无阻断错误；1：存在失效链接；2：检查未完成或运行异常）`, '']
  if (report.mode === 'internal-only') lines.push('本报告仅覆盖站内检查，不能作为正式发布的完整检查结论。', '')
  if (report.exitCode === 1) lines.push('**发布结论：存在阻断项，需要修复后重新检查。**', '')
  if (report.failure) lines.push(`检查无法完成：${cell(report.failure)}`, '')
  if (s) lines.push(`扫描文档：${s.documents} 个；链接引用：${s.references} 处；去重检查目标：${s.uniqueTargets} 个。`, '',
    `验证通过：${s.ok} 个；阻断错误：${s.error} 个；待确认：${s.warning} 个；已跳过：${s.skipped} 个。`, '',
    `外链目标：${s.externalUrls} 个；未验证的外站锚点引用：${s.externalFragmentsUnchecked} 处。`, '')
  for (const [status, title] of [['error', '阻断错误'], ['warning', '待确认问题'], ['skipped', '跳过项与临时例外']]) {
    const entries = report.results.filter(result => result.status === status)
    lines.push(`## ${title} (${entries.length})`, '')
    for (const result of entries) {
      lines.push(`### ${cell(issueLabels[result.code] || '检查结果')}（${cell(result.code)}）：${cell(result.target)}`, '', cell(result.message), '')
      if (result.owner) lines.push(`负责人：${cell(result.owner)}；到期日：${cell(result.expires)}（UTC 当日结束）。`, '')
      if (result.redirects?.length) {
        lines.push('重定向路径：', '')
        for (const hop of result.redirects) lines.push(`- HTTP ${cell(hop.statusCode)}：${cell(hop.from)} → ${cell(hop.to)}`)
        lines.push('')
      }
      lines.push('| 来源文件 | 行号:列号 | 来源页面地址 | 原始链接 |', '|---|---|---|---|')
      for (const ref of result.references) {
        lines.push(`| ${cell(ref.file)} | ${ref.line}:${ref.column} | ${cell(ref.pageUrl)} | ${cell(ref.url)} |`)
      }
      lines.push('')
    }
  }
  writeFileSync(path.join(reportDir, 'links.md'), lines.join('\n') + '\n')
}

export function printSummary(input) {
  const report = localizeReport(input)
  console.log(`链接检查：范围=${modeLabel(report.mode)}；检查${report.complete ? '已完成' : '未完成'}；退出码=${report.exitCode}`)
  if (report.failure) console.error(`检查无法完成：${report.failure}`)
  if (!report.summary) return
  const s = report.summary
  console.log(`已扫描 ${s.documents} 个文档、${s.references} 处链接引用，共 ${s.uniqueTargets} 个去重检查目标。`)
  console.log(`验证通过=${s.ok}；阻断错误=${s.error}；待确认=${s.warning}；已跳过=${s.skipped}`)
  const errors = report.results.filter(result => result.status === 'error')
  for (const error of errors.slice(0, 30)) {
    const ref = error.references[0]
    console.error(`${ref.file}:${ref.line}:${ref.column} [${error.code}] ${error.target} — ${error.message}（${error.references.length} 处引用）`)
  }
  if (errors.length > 30) console.error(`另有 ${errors.length - 30} 个阻断错误，请查看完整检查报告。`)
}
