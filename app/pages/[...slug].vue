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

type TocLink = {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

function extractTextFromMdcNode(node: unknown): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) {
    return node.slice(2).map(extractTextFromMdcNode).join('')
  }
  if (node && typeof node === 'object' && 'value' in node) {
    return String((node as { value?: unknown }).value ?? '')
  }
  return ''
}

const pageTocLinks = computed(() => {
  const bodyValue = page.value?.body?.value
  if (!Array.isArray(bodyValue)) return page.value?.body?.toc?.links || []

  const rootLinks: TocLink[] = []
  const stack: TocLink[] = []

  bodyValue.forEach((node) => {
    if (!Array.isArray(node)) return
    const tag = node[0]
    if (!['h2', 'h3', 'h4'].includes(tag)) return

    const props = node[1] as { id?: string } | undefined
    if (!props?.id) return

    const link: TocLink = {
      id: props.id,
      text: extractTextFromMdcNode(node),
      depth: Number(tag.slice(1)),
      children: []
    }

    while (stack.length && stack[stack.length - 1]!.depth >= link.depth) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]
    if (parent) {
      parent.children ||= []
      parent.children.push(link)
    } else {
      rootLinks.push(link)
    }

    stack.push(link)
  })

  return rootLinks.length ? rootLinks : page.value?.body?.toc?.links || []
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
    <UPage v-else-if="page">
      <UPageHeader
        :title="page.title"
        :links="page.links"
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
      <UPageBody>
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
          :links="pageTocLinks"
          :ui="{
            root: 'top-(--ui-topbar-height) lg:top-(--ui-header-height)'
          }"
        >
          <template
            v-if="pageTocLinks.length"
            #leading
          >
            <UIcon
              name="i-lucide-panel-left"
              class="size-5 shrink-0 text-muted lg:hidden"
              aria-hidden="true"
            />
          </template>
          <template
            v-if="pageTocLinks.length"
            #default
          >
            <span class="text-sm font-semibold text-highlighted truncate lg:hidden">
              {{ page.title }}
            </span>
            <span class="hidden text-base font-medium text-default lg:inline">
              {{ toc?.title || $t('pageToc.onPage') }}
            </span>
          </template>
          <template
            v-if="toc?.bottom"
            #bottom
          >
            <div
              class="hidden lg:block space-y-6"
              :class="{ '!mt-6': pageTocLinks.length }"
            >
              <USeparator
                v-if="pageTocLinks.length"
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
