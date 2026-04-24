<script setup lang="ts">
import { useDebounceFn, useEventListener } from '@vueuse/core'

const props = defineProps<{
  items: Array<{
    label: string
    to: string
  }>
}>()

const { defaultLocale, locale } = useI18n()
const localeRoute = useLocaleRoute()
const switchLocalePath = useSwitchLocalePath()
const normalizedPath = computed(() => switchLocalePath(defaultLocale))

const active = ref<string>('0')
const wrapRef = ref<HTMLElement | null>(null)
const canShow = ref(true)
/** tab 栏完整展示所需的最小宽度，首次渲染后锁定 */
let naturalWidth = 0

function captureNaturalWidth() {
  const root = wrapRef.value
  if (!root) return
  const list = root.querySelector<HTMLElement>('[role="tablist"]')
  if (!list) return
  naturalWidth = list.scrollWidth
}

function measureFit() {
  if (!naturalWidth) return
  canShow.value = window.innerWidth >= naturalWidth
}

function recaptureAndMeasure() {
  canShow.value = true
  nextTick(() => {
    requestAnimationFrame(() => {
      captureNaturalWidth()
      measureFit()
    })
  })
}

const debouncedMeasure = useDebounceFn(measureFit, 100)

watch([() => props.items, normalizedPath], ([list, path]) => {
  const idx = list.findIndex((i) => {
    const itemRoute = localeRoute(i.to, defaultLocale)
    const currentRoute = localeRoute(path, defaultLocale)

    if (!itemRoute || !currentRoute) return false

    if (itemRoute.path === '/' && currentRoute.path === '/') return true
    if (itemRoute.path === '/') return false

    const baseSegment = itemRoute.path.split('/')[1]
    return currentRoute.path.startsWith(`/${baseSegment}`)
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
    v-show="canShow"
    class="min-w-0"
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
