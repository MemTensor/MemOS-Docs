<script lang="ts">
// @ts-expect-error 构建期生成的主题模板无类型声明
import theme from '#build/ui-pro/prose/pre'
</script>

<script setup lang="ts">
/**
 * 覆盖 @nuxt/ui-pro 的 ProsePre（结构与原版一致，新增 API Key 注入能力）。
 *
 * opt-in：代码块 meta 含 `api-key` 时启用，如：
 *   ```python api-key            → 复制时把 YOUR_API_KEY 替换为用户真实 Key
 *   ```python api-key=MY_TOKEN   → 自定义占位符
 * 未标记的代码块行为与原版完全一致（直接复制原文）。
 *
 * 升级注意：模板需与 node_modules/@nuxt/ui-pro/dist/runtime/components/prose/Pre.vue 保持同步。
 */
import { tv } from '@nuxt/ui-pro/utils/tv'
import UCodeIcon from '@nuxt/ui-pro/runtime/components/prose/CodeIcon.vue'
import { DEFAULT_API_KEY_PLACEHOLDER } from '~/composables/useApiKeyResolver'

const props = defineProps({
  icon: { type: String, required: false },
  code: { type: String, required: false },
  language: { type: String, required: false },
  filename: { type: String, required: false },
  highlights: { type: Array, required: false },
  hideHeader: { type: Boolean, required: false },
  meta: { type: String, required: false },
  class: { type: null, required: false },
  ui: { type: null, required: false }
})

defineSlots()

const { t } = useI18n()
const appConfig = useAppConfig()
const uiStyle = computed(() => tv({ extend: tv(theme), ...(appConfig.uiPro?.prose?.pre || {}) })())

// meta 在 MDC 渲染后不变，setup 时一次性解析（未标记块不实例化任何业务 composable）
function parseApiKeyMeta(meta?: string): { placeholder: string } | null {
  const match = (meta || '').match(/\bapi-key(?:=(\S+))?/)
  if (!match) return null
  return { placeholder: match[1] || DEFAULT_API_KEY_PLACEHOLDER }
}
const optIn = parseApiKeyMeta(props.meta)
const resolver = optIn ? useApiKeyResolver() : null

const copied = ref(false)
const resolving = ref(false)
// 解析完成但剪贴板写入被拒（用户手势过期）时暂存替换文本，等待用户再点一次（新手势同步写入）。
// 含明文，10 秒未使用即清除（即取即弃原则下的最小停留窗口）
const pendingText = ref<string | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | undefined
let pendingTimer: ReturnType<typeof setTimeout> | undefined

function markCopied() {
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

function clearPending() {
  pendingText.value = null
  clearTimeout(pendingTimer)
}

async function writePlain(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    markCopied()
  } catch {
    // 极端情况（权限被禁）：保持静默，与原版 useClipboard 失败行为一致
  }
}

/** 手势可能已过期的异步写入：失败则转入「再次点击复制」 */
async function awaitThenWrite(textPromise: Promise<string>) {
  const text = await textPromise
  try {
    await navigator.clipboard.writeText(text)
    markCopied()
  } catch {
    pendingText.value = text
    clearTimeout(pendingTimer)
    pendingTimer = setTimeout(clearPending, 10_000)
  }
}

async function onCopyClick() {
  const code = props.code || ''

  // 上一轮解析完成但写入被拒：本次点击是新手势，同步写入
  if (pendingText.value) {
    const text = pendingText.value
    clearPending()
    await writePlain(text)
    return
  }

  if (!optIn || !resolver) {
    await writePlain(code)
    return
  }

  if (resolving.value) return
  resolving.value = true

  // resolve 只发起一次（picker 只弹一次）；失败/未登录/取消一律回退原文
  const textPromise = resolver.resolve({ source: code, placeholder: optIn.placeholder })
    .then(text => text ?? code)
    .catch(() => code)

  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      // 把 Promise 直接交给剪贴板：write 在用户手势内同步调用，内容稍后到达（Safari 友好）
      const blobPromise = textPromise.then(text => new Blob([text], { type: 'text/plain' }))
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blobPromise })])
      markCopied()
    } else {
      await awaitThenWrite(textPromise)
    }
  } catch {
    await awaitThenWrite(textPromise)
  } finally {
    resolving.value = false
  }
}

onBeforeUnmount(() => {
  clearTimeout(copiedTimer)
  clearTimeout(pendingTimer)
})
</script>

<template>
  <div :class="uiStyle.root({ class: [props.ui?.root], filename: !!filename })">
    <div
      v-if="filename && !hideHeader"
      :class="uiStyle.header({ class: props.ui?.header })"
    >
      <UCodeIcon
        :icon="icon"
        :filename="filename"
        :class="uiStyle.icon({ class: props.ui?.icon })"
      />

      <span :class="uiStyle.filename({ class: props.ui?.filename })">{{ filename }}</span>
    </div>

    <UButton
      :icon="copied ? appConfig.ui.icons.copyCheck : appConfig.ui.icons.copy"
      color="neutral"
      variant="outline"
      size="sm"
      :loading="resolving"
      :aria-label="t('apiKeyPicker.copy')"
      :class="uiStyle.copy({ class: props.ui?.copy })"
      tabindex="-1"
      @click="onCopyClick"
    />

    <pre
      :class="uiStyle.base({ class: [props.ui?.base, props.class] })"
      v-bind="$attrs"
    ><slot /></pre>
  </div>
</template>

<style>
.shiki span.line{display:block}.shiki span.line.highlight{margin:0 -16px;padding:0 16px;@apply bg-(--ui-bg-accented)/50}
</style>
