<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<ContentNavigationItem[]>('navigation')

// Remove trailing slash to match content path
const normalizedPath = route.path.replace(/\/$/, '') || '/'

const { data: page } = await useAsyncData(normalizedPath, () => {
  return queryCollection('docs').path(normalizedPath).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const surround = await useSurroundWithDesc(normalizedPath, navigation || [])

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
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
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
    <UPage v-if="page">
      <UPageHeader
        :title="page.title"
        :links="page.links"
      >
        <template #description>
          <div class="flex items-center gap-4 mb-4" v-if="page.avatar">
            <img
              :src="page.avatar.src"
              :alt="page.avatar.alt"
              class="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <img
            v-if="page.banner"
            :src="page.banner"
            alt="MemOS Banner"
            class="w-full mt-4 rounded-lg object-cover"
          />
          <div v-if="description" v-html="description"></div>
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
          :title="toc?.title"
          :links="page.body?.toc?.links"
        >
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
                :title="toc.bottom.title"
                :links="links"
              />
            </div>
          </template>
        </UContentToc>
      </template>
    </UPage>
  </UContainer>
</template>
