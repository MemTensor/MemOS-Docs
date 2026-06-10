import type { ApiKeyMasked, ProjectItem } from './useApiKeyResolver'

/**
 * API Key 选择器的全局服务（配合 ApiKeyPickerHost.vue 使用，app.vue 挂载一次）。
 * openPicker 返回 Promise，任意调用方可 await 用户的选择结果。
 */

export interface PickerContext {
  projects: ProjectItem[]
  /** 已预取的掩码 Key 列表（按项目）。仅掩码，无明文 */
  keysByProject: Record<string, ApiKeyMasked[]>
  /** 多项目场景下按需加载某项目的 Key 列表 */
  loadKeys?: (projectId: string) => Promise<ApiKeyMasked[]>
}

// client 单例状态。仅在用户点击后变更，SSR 阶段不参与渲染
const isOpen = ref(false)
const context = ref<PickerContext | null>(null)
let pendingResolve: ((value: number | null) => void) | null = null

export function useApiKeyPicker() {
  /** 打开选择器，resolve 用户选中的 apiKeyId；取消/关闭/无可选项 → null */
  function openPicker(ctx: PickerContext): Promise<number | null> {
    pendingResolve?.(null)
    context.value = ctx
    isOpen.value = true
    return new Promise((resolve) => {
      pendingResolve = resolve
    })
  }

  /** Host 组件回传结果（含取消） */
  function settle(value: number | null) {
    isOpen.value = false
    context.value = null
    pendingResolve?.(value)
    pendingResolve = null
  }

  return { isOpen, context, openPicker, settle }
}
