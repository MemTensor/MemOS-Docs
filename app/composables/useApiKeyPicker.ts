import type { ApiKeyMasked, ProjectItem } from './useApiKeyResolver'

/**
 * API Key 选择器的全局服务（配合 ApiKeyPickerHost.vue 使用，app.vue 挂载一次）。
 * openPicker 返回 Promise，任意调用方可 await 用户的选择结果。
 */

/**
 * 选择结果：
 * - { apiKeyId }：选中已有 Key，调用方需再调 keys/copy 取明文
 * - { plainKey }：页内新建，create 响应已带明文（即取即弃，勿入响应式状态）
 * - null：取消 / 关闭 / 无可选项
 */
export type PickerResult = { apiKeyId: string | number } | { plainKey: string } | null

export interface PickerContext {
  projects: ProjectItem[]
  /** 已预取的掩码 Key 列表（按项目）。仅掩码，无明文 */
  keysByProject: Record<string, ApiKeyMasked[]>
  /** 多项目场景下按需加载某项目的 Key 列表 */
  loadKeys?: (projectId: string) => Promise<ApiKeyMasked[]>
  /** 「无可用 Key」时页内创建，返回新 Key 明文 */
  createKey?: (projectId: string, keyName: string) => Promise<string>
}

// client 单例状态。仅在用户点击后变更，SSR 阶段不参与渲染
const isOpen = ref(false)
const context = ref<PickerContext | null>(null)
let pendingResolve: ((value: PickerResult) => void) | null = null

export function useApiKeyPicker() {
  /** 打开选择器，resolve 用户的选择结果；取消/关闭/无可选项 → null */
  function openPicker(ctx: PickerContext): Promise<PickerResult> {
    pendingResolve?.(null)
    context.value = ctx
    isOpen.value = true
    return new Promise((resolve) => {
      pendingResolve = resolve
    })
  }

  /** Host 组件回传结果（含取消）。context 留到关闭动画结束后再清，避免闪现空状态 */
  function settle(value: PickerResult) {
    isOpen.value = false
    pendingResolve?.(value)
    pendingResolve = null
  }

  /** 关闭动画结束（after:leave）后清空数据；若期间已重新打开则跳过 */
  function clearContext() {
    if (!isOpen.value) context.value = null
  }

  return { isOpen, context, openPicker, settle, clearContext }
}
