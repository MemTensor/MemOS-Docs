<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import type { FlatPathProps } from '~/utils/openapi'

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { t, locale } = useI18n()
const config = useRuntimeConfig()

// Remove trailing slash to match content path
const normalizedPath = route.path.replace(/\/$/, '') || '/'

const { data: page } = await useAsyncData(normalizedPath, () => {
  const docsPath = locale.value === 'cn' ? normalizedPath : `/en${normalizedPath}`

  return queryCollection('docs').path(docsPath).first()
})

// OpenAPI integration
const apiData = shallowRef<FlatPathProps | undefined>(undefined)
if (page.value?.meta?.['openapi']) {
  const { getOpenApi, paths } = useOpenApi('dashboardApi', 'dashboard/api')
  provide('collectionName', 'dashboardApi')
  await getOpenApi()

  const openapi = page.value.meta['openapi'] as string
  const [method, path] = openapi.split(' ')

  if (method && path) {
    apiData.value = paths.value.find(p => p.path === path && p.method.toLowerCase() === method.toLowerCase()) as unknown as FlatPathProps
  }
}

// Watch locale changes and refresh content
watch(locale, async (_newLocale: string) => {
  await refreshNuxtData(normalizedPath)
})

const pageValue = page.value as unknown as { body: { value: [string, object][] }, path: string }
if (import.meta.server) {
  useContent(pageValue)
}

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`surround-${normalizedPath}`, () => useSurroundWithDesc(normalizedPath, navigation?.value || [], locale.value, config.public.env), {
  watch: [locale, navigation]
})

const description = computed(() => {
  const frontmatterDesc = Object.keys(page.value || {}).includes('desc') ? page.value?.desc : undefined
  return frontmatterDesc
    // Process code blocks
    ?.replace(/(?:<code>|`)(.*?)(?:<\/code>|`)/g, '<code class="px-1.5 py-0.5 text-sm font-mono font-medium rounded-md inline-block border border-muted text-highlighted bg-muted">$1</code>')
    // Process bold text
    .replace(/(?:<strong>|\*\*)(.*?)(?:<\/strong>|\*\*)/g, '<strong style="color: var(--ui-text-highlighted)">$1</strong>')
    // Process links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
})

const links = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: 'community.edit',
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean).map((item) => {
    return {
      ...item,
      label: t(`${item.label}`)
    }
  })
})

useHead({
  title: page.value?.title,
  meta: [
    { name: 'description', content: page.value?.description }
  ]
})
</script>

<template>
  <UContainer>
    <template v-if="apiData">
      <ApiMain
        :data="apiData"
        :show-request-code="true"
        :show-surround="false"
      >
        <template
          v-if="page"
          #markdown
        >
          <ContentRenderer
            class="wrap-break-word"
            :value="page"
          />
        </template>
      </ApiMain>
      <USeparator
        v-if="surround?.length"
        :ui="{
          root: 'mt-8! mb-12!'
        }"
      />

      <UContentSurround :surround="surround" />
    </template>
    <UPage
      v-else-if="page"
      class="doc-page-grid"
    >
      <template #left>
        <UPageAside
          v-if="navigation?.length"
          class="doc-sidebar-nav overflow-auto scrollbar-hide"
        >
          <keep-alive>
            <UContentNavigation
              :key="route.path"
              :navigation="navigation"
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

      <UPageHeader
        :title="page.title"
        :links="page.links"
        class="doc-page-header max-w-[720px] mx-auto"
        :ui="{
          title: 'text-[1.95rem] sm:text-[2.15rem] leading-[1.14] tracking-[-0.02em] font-[650]',
          description: 'text-base sm:text-[1.0625rem] leading-7 text-muted',
          wrapper: 'flex flex-col gap-2.5',
          root: 'relative border-b border-default py-7'
        }"
      >
        <template #description>
          <div
            v-if="page.avatar"
            class="flex items-center gap-4 mb-4"
          >
            <img
              :src="page.avatar.src"
              :alt="page.avatar.alt"
              class="w-12 h-12 rounded-full object-cover"
            >
          </div>
          <img
            v-if="page.banner"
            :src="page.banner"
            alt="MemOS Banner"
            class="w-full mt-4 rounded-lg object-cover"
          >
          <div v-if="description" v-html="description" />
        </template>
      </UPageHeader>

      <!-- Document content -->
      <UPageBody class="doc-page-body max-w-[720px] mx-auto">
        <ContentRenderer
          v-if="page"
          :value="page"
        />
        <USeparator v-if="surround?.length" />

        <UContentSurround :surround="surround" />
      </UPageBody>

      <template
        #right
      >
        <UContentToc
          :default-open="false"
          highlight
          :links="page.body?.toc?.links"
          :ui="{
            root: 'top-(--ui-topbar-height) lg:top-(--ui-header-height) lg:-mx-0 lg:px-0',
            container:
              'pt-0 pb-2.5 sm:pb-4.5 lg:pt-8 lg:pb-8 border-b border-dashed border-default lg:border-0 flex flex-col gap-0',
            trigger:
              'group w-full min-h-14 py-4 px-5 sm:px-6 -mx-4 sm:-mx-6 text-left !items-start gap-3 rounded-none border-0 border-b border-default bg-default/80 hover:bg-elevated/60 dark:hover:bg-elevated/40',
            title: 'flex flex-col gap-1 min-w-0 flex-1 items-stretch text-left',
            trailing: 'ms-auto self-center shrink-0 pt-0.5'
          }"
        >
          <template
            v-if="page.body?.toc?.links?.length"
            #leading
          >
            <UIcon
              name="i-lucide-panel-left"
              class="size-5 shrink-0 text-muted lg:hidden"
              aria-hidden="true"
            />
          </template>
          <template
            v-if="page.body?.toc?.links?.length"
            #default
          >
            <div class="min-w-0 flex-1 text-left">
              <div class="flex flex-col gap-0.5 lg:hidden">
                <span class="text-xs font-medium text-muted">
                  {{ $t('pageToc.navLabel') }}
                </span>
                <span class="text-sm font-semibold text-highlighted line-clamp-2">
                  {{ page.title }}
                </span>
              </div>
              <span class="hidden text-base font-medium text-default lg:inline">
                {{ toc?.title || $t('pageToc.onPage') }}
              </span>
            </div>
          </template>
          <template
            v-if="toc?.bottom"
            #bottom
          >
            <div
              class="hidden lg:block space-y-6"
              :class="{ '!mt-6': page.body?.toc?.links?.length }"
            >
              <USeparator
                v-if="page.body?.toc?.links?.length"
                type="dashed"
              />

              <UPageLinks
                :title="t(`${toc.bottom.title}`)"
                :links="links"
              />
            </div>
          </template>
        </UContentToc>
      </template>
    </UPage>
  </UContainer>
</template>
