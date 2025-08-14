<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// 初始化全局路由守卫
useLocaleGuard()
const route = useRoute()

const { locale } = useI18n()
const contentNavigation = useContentNavigation(locale)

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

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/icon.svg' }
  ],
  htmlAttrs: {
    lang: 'en',
    class: 'dark'
  }
})

function showContentNavigation() {
  return route.path !== '/' && !isApiPage() && !route.path.includes('changelog')
}

function isApiPage() {
  return route.path.startsWith('/docs/api') || route.path.startsWith('/cn/docs/api/')
}

provide('navigation', contentNavigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

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
                    :navigation="contentNavigation"
                    highlight
                    :ui="{
                      linkTrailingBadge: 'font-semibold uppercase',
                      linkLeadingIcon: 'hidden'
                    }"
                  >
                    <template #link-title="{ link }">
                      <UTooltip :text="link.title" :delay-duration="100" class="w-full min-w-0">
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
    <template v-if="!showContentNavigation() && route.path !== '/'">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>

    <!-- Document home page -->
    <template v-if="route.path === '/'">
      <ClientOnly>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </ClientOnly>
    </template>

    <!-- Document footer -->
    <AppFooter v-if="!route.path.startsWith('/docs/api/')" />

    <ClientOnly>
      <LazyUContentSearch
        :files="processedFiles"
        :navigation="contentNavigation"
      />
    </ClientOnly>
  </UApp>
</template>
