<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { useI18n } from 'vue-i18n'

const route = useRoute()

const { locale, defaultLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const normalizedPath = computed(() => switchLocalePath(defaultLocale))
const contentNavigation = useContentNavigation(locale)

const normalizePath = (p: string) => p.replace(/\/$/, '')

const getSegment = (p: string) => {
  const normalized = normalizePath(p).replace(/^\/(cn|en)(\/|$)/, '/')
  const parts = normalized.split('/').filter(Boolean)
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

  if (!currentSegment.value) return []

  const activeNode = nav.find(item => hasDescendantWithSegment(item, currentSegment.value))

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

const htmlClass = computed(() => {
  if (import.meta.client) {
    if (!isSupportCssOklch()) {
      return 'compact'
    }
  }
  return 'dark'
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/icon.svg' }
  ],
  htmlAttrs: {
    lang: 'en',
    class: htmlClass
  }
})

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
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <div class="flex flex-col flex-1 min-w-0">
        <AppHeader v-if="!isApiPage()" />

        <!-- Document pages -->
        <template v-if="showContentNavigation()">
          <UMain>
            <UContainer>
              <UPage>
                <!-- Document navigation -->
                <template #left>
                  <UPageAside class="overflow-auto scrollbar-hide">
                    <!-- Use keep-alive to maintain menu state -->
                    <keep-alive>
                      <UContentNavigation
                        v-if="filteredNavigation?.length"
                        :key="currentSegment"
                        :navigation="filteredNavigation"
                        highlight
                        :ui="{
                          linkTrailingBadge: 'font-semibold uppercase',
                          linkLeadingIcon: 'hidden'
                        }"
                      >
                        <template #link-title="{ link }">
                          <UTooltip
                            :text="link.title"
                            :delay-duration="100"
                            class="w-full min-w-0"
                          >
                            <span class="inline-flex items-center gap-2 w-full min-w-0 max-w-full">
                              <UIcon
                                v-if="link.icon && typeof link.icon === 'string'"
                                :name="link.icon as string"
                                class="w-4 h-4 flex-shrink-0"
                              />
                              <span class="truncate flex-1 min-w-0">{{ link.title }}</span>
                              <UIcon
                                v-if="link.target === '_blank'"
                                name="i-ri-external-link-line"
                                class="w-3 h-3 flex-shrink-0 text-gray-400"
                              />
                            </span>
                          </UTooltip>
                        </template>
                      </UContentNavigation>
                    </keep-alive>
                  </UPageAside>
                </template>

                <!-- Document content -->
                <NuxtPage />
              </UPage>
            </UContainer>
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
        :navigation="contentNavigation"
      />
    </ClientOnly>
  </UApp>
</template>
