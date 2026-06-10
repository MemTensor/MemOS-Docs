/**
 * 登录态感知（通用地基）
 *
 * 与具体业务无关：只回答「用户是否登录」，并提供自动携带登录态的请求器 authedFetch。
 * 任何「登录后获取信息」的能力（API Key、配额、用户资料等）都应复用本模块，
 * 各自实现自己的业务 composable，互不耦合。
 *
 * 安全约束（见 docs_auth-aware_copy 方案）：
 * - 对共享 cookie（domain=.openmem.net，归 Platform 管理）只读，绝不写入/删除；
 * - 不对外导出裸 token；token 不写入 localStorage / 状态库等任何持久层；
 * - 401/过期仅在本站内降级（抛 AuthRequiredError 由调用方处理）。
 */

interface BaseResponse<T> {
  code: number
  data: T
  message?: string
}

export interface AuthedFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  query?: Record<string, unknown>
  /** 默认指向 dashboardApiBase（Playground 后端），其他后端可覆盖 */
  baseURL?: string
  headers?: Record<string, string>
}

/** 未登录 / token 失效。调用方捕获后走降级分支（如复制原文） */
export class AuthRequiredError extends Error {
  constructor(message = 'login required') {
    super(message)
    this.name = 'AuthRequiredError'
  }
}

/** 后端 NOT_LOGIN / 无权限业务码（HTTP 可能仍为 200） */
const NOT_LOGIN_CODES = new Set([40100, 40101])

function readAuthToken(): string | null {
  if (import.meta.server || typeof document === 'undefined') return null

  const config = useRuntimeConfig()
  const cookieName = (config.public.authCookieName as string) || 'memos_token'
  const entry = document.cookie
    .split('; ')
    .find(item => item.startsWith(`${cookieName}=`))

  if (!entry) return null
  const value = entry.slice(cookieName.length + 1)
  return value ? decodeURIComponent(value) : null
}

export function useAuthSession() {
  const config = useRuntimeConfig()

  /** 按需检查（点击时调用）。如需「按登录态渲染 UI」的响应式视图，在此扩展 authState（useState + focus 刷新），勿在业务层各自读 cookie */
  function isLoggedIn(): boolean {
    return Boolean(readAuthToken())
  }

  /**
   * 自动携带 Authorization 的请求器：
   * - 未登录 / HTTP 401/403 / 业务码 40100 → 抛 AuthRequiredError
   * - 其他业务失败（code !== 0）→ 抛普通 Error
   * - 成功 → 解包 BaseResponse 返回 data
   */
  async function authedFetch<T>(path: string, options: AuthedFetchOptions = {}): Promise<T> {
    const token = readAuthToken()
    if (!token) throw new AuthRequiredError()

    const { baseURL, headers, ...rest } = options

    let res: BaseResponse<T>
    try {
      res = await $fetch<BaseResponse<T>>(path, {
        ...rest,
        baseURL: baseURL || (config.public.dashboardApiBase as string) || 'https://memos.memtensor.cn',
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`
        }
      })
    } catch (error) {
      const status = (error as { statusCode?: number, response?: { status?: number } })?.statusCode
        ?? (error as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) throw new AuthRequiredError()
      throw error
    }

    if (res && typeof res === 'object' && 'code' in res) {
      if (NOT_LOGIN_CODES.has(res.code)) throw new AuthRequiredError()
      if (res.code !== 0) throw new Error(res.message || `request failed with code ${res.code}`)
      return res.data
    }
    return res as unknown as T
  }

  return { isLoggedIn, authedFetch }
}
