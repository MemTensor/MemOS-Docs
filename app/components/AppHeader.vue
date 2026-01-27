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
    { label: t('header.menus.mcpAgent'), to: '/mcp_agent/mcp/guide' },
    { label: t('header.menus.apiDocs'), to: '/api_docs/start/overview' },
    { label: t('header.menus.samples'), to: '/usecase/knowledge_qa_assistant' },
    { label: t('header.menus.changelog'), to: '/changelog' }
  ]
  return menus.map(m => ({ ...m, to: localePath(m.to) }))
})

function gotoHome() {
  navigateTo(homePath.value, {
    external: true,
    open: {
      target: '_blank'
    }
  })
}
</script>

<template>
  <UHeader
    :to="homePath"
    :ui="{
      root: 'border-0 h-(--ui-topbar-height)',
      container: 'lg:px-10',
      header: 'h-(--ui-topbar-height)'
    }"
  >
    <template #left>
      <NuxtLink :to="homePath">
        <LogoPro class="w-auto h-10 shrink-0" />
      </NuxtLink>
    </template>

    <UContentSearchButton
      v-if="header?.search"
      class="cursor-pointer"
      :collapsed="false"
      :kbds="[]"
      :label="$t('header.searchPlaceholder')"
      :ui="{
        base: 'w-90 h-10 text-[#94A3B8] rounded-lg ring-slate-600'
      }"
    />
    <AssistantCollapse class="ml-2.5" />

    <template #right>
      <LanguageSwitcher />
      <JoinCommunityButton />
      <button
        class="hidden sm:flex items-center gap-1.5 h-7 px-2.5 bg-linear-270 from-15% from-linear-primary to-118% to-primary-light rounded-md cursor-pointer"
        @click="gotoHome"
      >
        <UIcon
          name="ri:home-4-line"
          class="size-4"
        />
        <span class="text-xs font-medium">
          {{ $t('header.backToHome') }}
        </span>
      </button>
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
    class="hidden sm:block sticky z-12 top-(--ui-topbar-height) pt-3 bg-default/75 backdrop-blur"
    :items="localizedMenus"
  />
</template>
