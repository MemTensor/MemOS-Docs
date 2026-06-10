/**
 * API Key 注入（业务能力，建立在 useAuthSession 地基之上）
 *
 * 编排链路：project/list → keys/list（id + 名称 + 掩码，仅用于展示）→ keys/copy（明文）。
 * 后端约束（已验证）：list 返回掩码、dict 不含 key 值，只有 copy 返回明文。
 *
 * 安全约束：
 * - 明文 Key 即取即弃：仅在一次复制流程内存在，不缓存、不预取、不进响应式状态；
 * - 明文永不渲染进 DOM（站内 Clarity 录屏会录 DOM）、不拼进 URL；
 * - 项目/掩码列表可会话级缓存（不含敏感明文）。
 *
 * 扩展约定：resolve 内部按「占位符 → 取值器」组织，API Key 是第一个取值器；
 * 未来需要替换 YOUR_PROJECT_ID 等占位符时在 buildReplacements 中并列扩展。
 */

export interface ApiKeyMasked {
  id: number
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

  async function fetchProjects(): Promise<ProjectItem[]> {
    if (projectsCache.value) return projectsCache.value
    const data = await authedFetch<PageResponse<ProjectItem>>('/api/dashboard/project/list', {
      method: 'POST',
      body: { pageNum: 1, pageSize: PAGE_SIZE }
    })
    const projects = data?.records || []
    projectsCache.value = projects
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
    keysCache.value = { ...keysCache.value, [projectId]: keys }
    return keys
  }

  /** 取明文。即取即弃：调用方用完即丢，不得缓存 */
  function fetchPlainKey(apiKeyId: number): Promise<string> {
    return authedFetch<string>('/api/dashboard/keys/copy', {
      method: 'POST',
      body: { apiKeyId }
    })
  }

  /**
   * 决定使用哪个 Key：
   * - 无项目 / 无 Key → 弹兜底引导，返回 null
   * - 单项目单 Key → 不弹窗直接用
   * - 其余（单项目多 Key / 多项目）→ 弹选择器
   */
  async function pickApiKeyId(): Promise<number | null> {
    const projects = await fetchProjects()
    if (!projects.length) {
      await openPicker({ projects: [], keysByProject: {} })
      return null
    }

    if (projects.length === 1) {
      const onlyProject = projects[0]!
      const keys = await fetchKeys(onlyProject.id)
      if (keys.length === 1) return keys[0]!.id
      return openPicker({
        projects,
        keysByProject: { [onlyProject.id]: keys },
        loadKeys: fetchKeys
      })
    }

    return openPicker({ projects, keysByProject: {}, loadKeys: fetchKeys })
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
      const apiKeyId = await pickApiKeyId()
      if (apiKeyId == null) return null

      const plainKey = await fetchPlainKey(apiKeyId)
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
