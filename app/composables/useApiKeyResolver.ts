/**
 * API Key 注入（业务能力，建立在 useAuthSession 地基之上）
 *
 * 编排链路：project/list → keys/list（id + 名称 + 掩码，仅用于展示）→ keys/copy（明文）。
 * 后端约束（已验证）：list 返回掩码、dict 不含 key 值；明文仅来自 copy 或 create 响应。
 *
 * id 约束：后端 id 为 int64 雪花值，超出 JS 安全整数范围。list 序列化为字符串可安全透传，
 * 但 create 响应的 id 是 JSON 数字，JSON.parse 即精度丢失 —— 因此 id 一律按不透明值透传、
 * 绝不参与运算，且创建路径不使用 create 返回的 id（直接用其明文 apiKey）。
 *
 * 安全约束：
 * - 明文 Key 即取即弃：仅在一次复制流程内存在，不缓存、不预取、不进响应式状态；
 * - 明文永不渲染进 DOM（站内 Clarity 录屏会录 DOM）、不拼进 URL；
 * - 项目/掩码列表可会话级缓存（不含敏感明文）。
 *
 * 扩展约定：resolve 内部按「占位符 → 取值器」组织，API Key 是第一个取值器；
 * 未来需要替换 YOUR_PROJECT_ID 等占位符时在 buildReplacements 中并列扩展。
 */

import type { PickerResult } from './useApiKeyPicker'

export interface ApiKeyMasked {
  /** 不透明 id（list 实际返回字符串），原样透传给 keys/copy */
  id: string | number
  /** 掩码形式，如 mpg-****abcd，仅用于展示 */
  apiKey: string
  keyName: string
  projectId: string
  expiresAt: string | null
}

export interface ProjectItem {
  id: string
  name: string
}

interface PageResponse<T> {
  records: T[]
  total: number
}

export interface ResolveOptions {
  /** 原文（如代码块内容） */
  source: string
  /** 要替换的占位符，默认 YOUR_API_KEY */
  placeholder?: string
}

export const DEFAULT_API_KEY_PLACEHOLDER = 'YOUR_API_KEY'

/** 分页接口默认 pageSize 10，取大值避免多项目/多 Key 用户漏选 */
const PAGE_SIZE = 100

function isUsableKey(key: ApiKeyMasked): boolean {
  if (!key.expiresAt) return true
  const expires = new Date(key.expiresAt).getTime()
  return Number.isNaN(expires) || expires > Date.now()
}

export function useApiKeyResolver() {
  const { isLoggedIn, authedFetch } = useAuthSession()
  const { openPicker } = useApiKeyPicker()

  // 会话级缓存（仅项目与掩码列表，不含明文）
  const projectsCache = useState<ProjectItem[] | null>('api-key-projects', () => null)
  const keysCache = useState<Record<string, ApiKeyMasked[]>>('api-key-masked-keys', () => ({}))

  // 空结果不写缓存：用户可能随时去 Dashboard 补建项目/Key，回来重试时必须能查到最新数据
  async function fetchProjects(): Promise<ProjectItem[]> {
    if (projectsCache.value) return projectsCache.value
    const data = await authedFetch<PageResponse<ProjectItem>>('/api/dashboard/project/list', {
      method: 'POST',
      body: { pageNum: 1, pageSize: PAGE_SIZE }
    })
    const projects = data?.records || []
    if (projects.length) projectsCache.value = projects
    return projects
  }

  async function fetchKeys(projectId: string): Promise<ApiKeyMasked[]> {
    const cached = keysCache.value[projectId]
    if (cached) return cached
    const data = await authedFetch<PageResponse<ApiKeyMasked>>('/api/dashboard/keys/list', {
      method: 'POST',
      body: { projectId, pageNum: 1, pageSize: PAGE_SIZE }
    })
    const keys = (data?.records || []).filter(isUsableKey)
    if (keys.length) keysCache.value = { ...keysCache.value, [projectId]: keys }
    return keys
  }

  /**
   * 页内创建 Key（复用 Dashboard 的 keys/create 接口），返回新 Key 明文。
   * create 响应自带完整明文，直接使用 —— 不读其 id（JSON 数字精度丢失）、不再调 copy。
   * 创建后失效该项目缓存，下次打开选择器时重查即可看到新 Key。
   */
  async function createKey(projectId: string, keyName: string): Promise<string> {
    const created = await authedFetch<{ apiKey?: string } | null>('/api/dashboard/keys/create', {
      method: 'POST',
      body: { keyName, projectId }
    })
    keysCache.value = Object.fromEntries(
      Object.entries(keysCache.value).filter(([id]) => id !== projectId)
    )
    const plainKey = created?.apiKey
    // 防后端改为返回掩码：掩码注入到用户剪贴板是更糟的静默错误
    if (!plainKey || plainKey.includes('*')) {
      throw new Error('create api key failed: no plain key in response')
    }
    return plainKey
  }

  /** 取明文。即取即弃：调用方用完即丢，不得缓存 */
  function fetchPlainKey(apiKeyId: string | number): Promise<string> {
    return authedFetch<string>('/api/dashboard/keys/copy', {
      method: 'POST',
      body: { apiKeyId }
    })
  }

  /**
   * 决定使用哪个 Key：
   * - 无项目 → 弹兜底引导，返回 null
   * - 有项目（无论单/多项目、单/多 Key）→ 一律弹选择器，由用户确认后使用，
   *   保证「获取 API Key」这一行为对用户始终可感知；单项目预取 Key 列表避免弹窗内加载闪烁
   */
  async function pickApiKey(): Promise<PickerResult> {
    const projects = await fetchProjects()
    if (!projects.length) {
      await openPicker({ projects: [], keysByProject: {} })
      return null
    }

    const keysByProject = projects.length === 1
      ? { [projects[0]!.id]: await fetchKeys(projects[0]!.id) }
      : {}
    return openPicker({ projects, keysByProject, loadKeys: fetchKeys, createKey })
  }

  /**
   * 将原文中的占位符替换为真实值。
   * 未登录、无可用 Key、用户取消、网络/业务错误 → 返回 null（调用方降级为原文）。
   */
  async function resolve(options: ResolveOptions): Promise<string | null> {
    if (import.meta.server) return null
    if (!isLoggedIn()) return null

    const placeholder = options.placeholder || DEFAULT_API_KEY_PLACEHOLDER
    if (!options.source.includes(placeholder)) return null

    try {
      // 「占位符 → 取值器」：当前仅 apiKey 一个，未来在此并列扩展
      const picked = await pickApiKey()
      if (!picked) return null

      // 页内新建已带明文；选已有 Key 则按不透明 id 调 copy 取明文
      const plainKey = 'plainKey' in picked ? picked.plainKey : await fetchPlainKey(picked.apiKeyId)
      if (!plainKey) return null

      return options.source.split(placeholder).join(plainKey)
    } catch (error) {
      if (!(error instanceof AuthRequiredError)) {
        console.warn('[api-key-resolver] resolve failed, fallback to original text:', error)
      }
      return null
    }
  }

  return { resolve }
}
