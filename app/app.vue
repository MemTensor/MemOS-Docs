<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { useI18n } from 'vue-i18n'

const route = useRoute()

const { locale, defaultLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const normalizedPath = computed(() => switchLocalePath(defaultLocale))
const contentNavigation = useContentNavigation(locale)

const searchNavigation = computed(() => {
  return (contentNavigation.value || []).map((item, index) => ({
    ...item,
    path: item.path || `search-group-${index}`
  }))
})

const normalizePath = (p: string) => p.replace(/\/$/, '')

const stripLocalePrefix = (p: string) => p.replace(/^\/(cn|en)(\/|$)/, '/')

/** 去掉尾斜杠与语言前缀，便于跨语言比较路径 */
const localeFreePath = (p: string) => stripLocalePrefix(normalizePath(p))

const getSegment = (p: string) => {
  const parts = localeFreePath(p).split('/').filter(Boolean)
  return parts[0]
}

const currentSegment = computed(() => getSegment(route.path))

const filteredNavigation = computed(() => {
  if (!contentNavigation.value) return []

  const nav = contentNavigation.value
  const path = route.path

  if (normalizePath(path).includes('/dashboard/api')) {
    return []
  }

  const hasDescendantWithSegment = (item: ContentNavigationItem, segment: string): boolean => {
    if (item.path && getSegment(item.path) === segment) return true
    if (item.children) {
      return item.children.some((child: ContentNavigationItem) => hasDescendantWithSegment(child, segment))
    }
    return false
  }

  /**
   * 返回该分组下与当前路径最匹配的降级路径长度，用于区分首段路径相同的分组
   * （例如 /usecase 下的技术教程与 /usecase/blog 下的博客）。
   */
  const matchDepth = (item: ContentNavigationItem, target: string): number => {
    let best = -1

    const visit = (node: ContentNavigationItem) => {
      if (node.path) {
        const path = localeFreePath(node.path)
        if (target === path || target.startsWith(`${path}/`)) {
          best = Math.max(best, path.length)
        }
      }
      node.children?.forEach(visit)
    }

    visit(item)
    return best
  }

  if (!currentSegment.value) return []

  const segment = currentSegment.value
  let activeNode: ContentNavigationItem | undefined
  let bestDepth = -1

  for (const item of nav) {
    const depth = matchDepth(item, localeFreePath(route.path))
    if (depth > bestDepth) {
      bestDepth = depth
      activeNode = item
    }
  }

  // 页面未列入导航时退回按首段路径归类
  if (bestDepth < 0) {
    activeNode = nav.find(item => hasDescendantWithSegment(item, segment))
  }

  if (!activeNode) return []

  const mapNavigation = (items: ContentNavigationItem[], level = 0): ContentNavigationItem[] => {
    return items.map((item) => {
      const isOpen = level === 0 || hasActiveChild(item, route.path) || item.icon === 'i-ri-flag-line' || item.icon === 'i-ri-vip-diamond-line'
      const isActive = item.path && normalizePath(item.path) === normalizePath(route.path)
      return {
        ...item,
        active: isActive,
        defaultOpen: isOpen,
        children: item.children ? mapNavigation(item.children, level + 1) : undefined
      } as ContentNavigationItem
    })
  }

  const hasActiveChild = (item: ContentNavigationItem, currentPath: string): boolean => {
    if (item.path && normalizePath(item.path) === normalizePath(currentPath)) return true
    if (item.children) {
      return item.children.some(child => hasActiveChild(child, currentPath))
    }
    return false
  }

  return mapNavigation(activeNode.children || [])
})

const { data: files } = useLazyAsyncData(`search`, () => queryCollectionSearchSections('docs'), {
  server: false,
  watch: [locale]
})

// Process files to remove en language prefix
const processedFiles = computed(() => {
  if (!files.value) return []

  return files.value.filter(file => file.id.startsWith(`/${locale.value}`)).map(file => ({
    ...file,
    id: locale.value === 'en' ? file.id.replace(`/${locale.value}`, '') : file.id
  }))
})

const isSupportCssOklch = (): boolean => {
  return CSS.supports('color', 'oklch(0% 0 0)')
}

const needsCompact = ref(false)
onMounted(() => {
  if (!isSupportCssOklch()) {
    needsCompact.value = true
  }
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/icon.svg' },
    { rel: 'author', type: 'text/plain', href: '/llms.txt' }
  ]
})

// 正式入口固定为 memos-docs.openmem.net：同一份代码会部署到多个域名
// （如灰度域 docs-gray.openmem.net），canonical 统一指向正式域的同路径页面，
// 避免搜索引擎把重复页面分开收录。
// html lang 之前固定为 en，中文页面也标成英文；改为跟随当前语言。
const CANONICAL_ORIGIN = 'https://memos-docs.openmem.net'
useHead(() => ({
  link: [
    { rel: 'canonical', href: `${CANONICAL_ORIGIN}${route.path.endsWith('/') ? route.path : `${route.path}/`}` }
  ],
  htmlAttrs: {
    lang: locale.value === 'cn' ? 'zh-CN' : 'en'
  }
}))

function showContentNavigation() {
  const path = normalizedPath.value
  return path !== '/'
    && !isApiPage()
    && !path.includes('changelog')
    && !path.includes('/dashboard/api')
}

function isApiPage() {
  const path = normalizePath(route.path)
  return path.startsWith('/docs/api')
    || path.startsWith('/cn/docs/api')
    || path.startsWith('/api-reference')
    || path.startsWith('/cn/api-reference')
}

provide('navigation', filteredNavigation)
</script>

<template>
  <UApp>
    <div aria-hidden="true" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">
      For AI agents: complete documentation index at <a href="/llms.txt">/llms.txt</a>.
      Full text at <a href="/llms-full.txt">/llms-full.txt</a>.
      Markdown version of any page available by appending .md to its URL.
    </div>
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <NuxtLayout>
      <div
        class="flex flex-col flex-1 min-w-0"
        :class="{ compact: needsCompact }"
      >
        <AppHeader v-if="!isApiPage()" />

        <!-- Document pages -->
        <template v-if="showContentNavigation()">
          <UMain>
            <NuxtPage />
          </UMain>
        </template>

        <!-- Changelog page -->
        <template v-if="!showContentNavigation()">
          <NuxtPage />
        </template>
      </div>
    </NuxtLayout>

    <ClientOnly>
      <LazyUContentSearch
        :files="processedFiles"
        :navigation="searchNavigation"
      />
      <ApiKeyPickerHost />
    </ClientOnly>
  </UApp>
</template>
