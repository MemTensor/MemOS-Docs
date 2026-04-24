<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { getHomePath } from '~/utils'

const { t, locale } = useI18n()
const { header } = useAppConfig()
const localePath = useLocalePath()
const homePath = computed(() => {
  return getHomePath('/', locale.value)
})
// docs navigation for mobile
const navigation = inject<ContentNavigationItem[]>('navigation', [])
const localizedMenus = computed(() => {
  const menus = [
    { label: t('header.menus.welcome'), to: '/' },
    { label: t('header.menus.cloud'), to: '/memos_cloud/overview' },
    { label: t('header.menus.openSource'), to: '/open_source/getting_started/installation' },
    { label: t('header.menus.selfDevelopedModel'), to: '/self_developed_model/extraction_usage_example' },
    { label: t('header.menus.openclaw'), to: '/openclaw/guide' },
    { label: t('header.menus.mcpAgent'), to: '/mcp_agent/mcp/guide' },
    { label: t('header.menus.apiDocs'), to: '/api_docs/start/overview' },
    { label: t('header.menus.samples'), to: '/usecase/knowledge_qa_assistant' },
    { label: t('header.menus.changelog'), to: '/changelog' }
  ]
  return menus.map(m => ({ ...m, to: localePath(m.to) }))
})

const dashboardUrl = computed(() => useDashboardUrl('/quickstart/', locale.value))
</script>

<template>
  <UHeader
    :to="homePath"
    :ui="{
      root: 'border-0 h-(--ui-topbar-height)',
      container: '@container',
      header: 'h-(--ui-topbar-height)'
    }"
  >
    <template #left>
      <NuxtLink
        :to="homePath"
        class="text-slate-900 dark:text-white"
      >
        <LogoPro class="w-auto h-10 shrink-0" />
      </NuxtLink>
    </template>

    <UContentSearchButton
      v-if="header?.search"
      class="cursor-pointer w-90 @max-3xl:w-60"
      :collapsed="false"
      :kbds="[]"
      :label="$t('header.searchPlaceholder')"
      :ui="{
        base: 'h-8 text-slate-600 dark:text-slate-400 rounded-lg ring-slate-200 dark:ring-slate-600',
        leadingIcon: 'size-4'
      }"
    />
    <AssistantCollapse class="ml-2.5" />

    <template #right>
      <NuxtLink
        :to="dashboardUrl"
        target="_blank"
        class="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-md cursor-pointer shrink-0 whitespace-nowrap border border-slate-300 text-slate-700 hover:border-primary hover:text-primary dark:border-0 dark:text-white dark:bg-linear-270 dark:from-15% dark:from-linear-primary dark:to-118% dark:to-primary-light"
      >
        <UIcon
          name="ri:dashboard-line"
          class="size-4"
        />
        <span class="text-sm font-medium flex @max-5xl:hidden">
          {{ $t('header.dashboard') }}
        </span>
      </NuxtLink>
      <LanguageSwitcher class="shrink-0" />
      <ColorModeToggle />
      <JoinCommunityButton class="shrink-0 @max-2xl:hidden" />
    </template>

    <template #body>
      <UNavigationMenu
        orientation="vertical"
        :items="localizedMenus"
        class="justify-center"
      >
        <template #item="{ item }">
          <div>{{ item.label }}</div>
        </template>
      </UNavigationMenu>

      <USeparator
        type="dashed"
        class="mt-4 mb-6"
      />

      <UContentNavigation
        highlight
        :navigation="navigation"
      />
    </template>
  </UHeader>
  <AppMenus
    class="hidden sm:block sticky z-12 top-(--ui-topbar-height) pt-1.5 bg-default/75 backdrop-blur"
    :items="localizedMenus"
  />
</template>
