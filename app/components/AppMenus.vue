<script setup lang="ts">
import { useDebounceFn, useEventListener } from '@vueuse/core'

const props = defineProps<{
  items: Array<{
    label: string
    to: string
    /** 一个 Tab 对应多个路径前缀时使用，例如合并后的 Agent框架支持 */
    match?: string[]
  }>
}>()
const emit = defineEmits<{
  visibleChange: [visible: boolean]
}>()

const { defaultLocale, locale } = useI18n()
const localeRoute = useLocaleRoute()
const switchLocalePath = useSwitchLocalePath()
const normalizedPath = computed(() => switchLocalePath(defaultLocale))

const active = ref<string>('0')
const wrapRef = ref<HTMLElement | null>(null)
const canShow = ref(false)
const isMeasuring = ref(true)
/** tab 栏完整展示所需的最小宽度，首次渲染后锁定 */
let naturalWidth = 0

function captureNaturalWidth() {
  const root = wrapRef.value
  if (!root) return
  const list = root.querySelector<HTMLElement>('[role="tablist"]')
  if (!list) return
  const triggers = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'))
  const triggersWidth = triggers.reduce((total, trigger) => {
    const style = window.getComputedStyle(trigger)
    const marginX = Number.parseFloat(style.marginLeft || '0') + Number.parseFloat(style.marginRight || '0')

    return total + trigger.getBoundingClientRect().width + marginX
  }, 0)

  naturalWidth = Math.ceil(triggersWidth || list.scrollWidth)
}

function measureFit() {
  if (!naturalWidth) return
  const root = wrapRef.value
  const list = root?.querySelector<HTMLElement>('[role="tablist"]')
  const availableWidth = root?.parentElement?.getBoundingClientRect().width || window.innerWidth
  const listRect = list?.getBoundingClientRect()
  const triggers = list ? Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')) : []
  const firstTriggerRect = triggers[0]?.getBoundingClientRect()
  const lastTriggerRect = triggers[triggers.length - 1]?.getBoundingClientRect()
  const visuallyOverflowing = !!(listRect && firstTriggerRect && lastTriggerRect && (
    firstTriggerRect.left < listRect.left || lastTriggerRect.right > listRect.right
  ))
  const safetyGap = locale.value === 'en' ? 96 : 8

  canShow.value = availableWidth >= naturalWidth + safetyGap && !visuallyOverflowing
  emit('visibleChange', canShow.value)
}

function recaptureAndMeasure() {
  isMeasuring.value = true
  canShow.value = true
  nextTick(() => {
    requestAnimationFrame(() => {
      captureNaturalWidth()
      measureFit()
      isMeasuring.value = false
    })
  })
}

const debouncedMeasure = useDebounceFn(measureFit, 100)

/** 返回该菜单项在 currentPath 上命中的最长前缀，未命中则返回空字符串 */
function matchedPrefix(item: { to: string, match?: string[] }, currentPath: string) {
  if (item.match?.length) {
    const hit = item.match
      .filter(prefix => currentPath.startsWith(prefix))
      .sort((a, b) => b.length - a.length)[0]

    return hit || ''
  }

  const itemRoute = localeRoute(item.to, defaultLocale)
  if (!itemRoute) {
    return ''
  }

  if (itemRoute.path === '/') {
    return currentPath === '/' ? '/' : ''
  }

  const baseSegment = `/${itemRoute.path.split('/')[1]}`
  return currentPath.startsWith(baseSegment) ? baseSegment : ''
}

watch([() => props.items, normalizedPath], ([list, path]) => {
  const currentRoute = localeRoute(path, defaultLocale)

  if (!currentRoute) {
    return
  }

  // 一个 Tab 可能对应多个路径前缀（例如 /usecase 与 /usecase/blog），
  // 取命中前缀最长的那一个，避免父级前缀抢占子级页面。
  let idx = -1
  let matchedLength = 0

  list.forEach((item, index) => {
    const hit = matchedPrefix(item, currentRoute.path)
    if (hit.length > matchedLength) {
      matchedLength = hit.length
      idx = index
    }
  })

  if (idx !== -1) active.value = String(idx)
}, { immediate: true })

watch(() => props.items, () => nextTick(() => recaptureAndMeasure()), { deep: true })
watch(locale, () => nextTick(() => recaptureAndMeasure()))

onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(() => {
      captureNaturalWidth()
      measureFit()
      isMeasuring.value = false
    })
  })
})

useEventListener(window, 'resize', debouncedMeasure)

function onChange(index: string | number) {
  const to = props.items?.[Number(index)]?.to
  if (to) {
    navigateTo(to)
  }
}
</script>

<template>
  <div
    ref="wrapRef"
    v-show="canShow || isMeasuring"
    class="min-w-0"
    :class="isMeasuring ? 'pointer-events-none absolute left-0 top-0 w-full opacity-0' : ''"
  >
    <UTabs
      v-model="active"
      :items="items"
      variant="link"
      :ui="{
        root: 'gap-0',
        list: 'p-0 justify-center border-slate-100 dark:border-default',
        indicator: 'h-0.5',
        trigger: 'shrink-0 w-auto mx-5 px-0 py-2 text-sm leading-5 font-medium cursor-pointer data-[state=inactive]:text-slate-900 dark:data-[state=inactive]:text-slate-200 hover:data-[state=inactive]:not-disabled:text-black dark:hover:data-[state=inactive]:not-disabled:text-white'
      }"
      @update:model-value="onChange"
    >
      <template #default="{ item, index }">
        <span :class="index === Number(active) ? 'text-indigo-600 dark:text-primary font-semibold' : ''">
          {{ item.label }}
        </span>
      </template>
    </UTabs>
  </div>
</template>
