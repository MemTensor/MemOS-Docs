<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { getHomePath } from '~/utils'

const { t, locale } = useI18n()
const { header } = useAppConfig()
const localePath = useLocalePath()
const homePath = computed(() => {
  return getHomePath('/', locale.value)
})
const topMenusVisible = ref(false)
const headerOpen = ref(false)
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

const dashboardUrl = computed(() => useDashboardLoginUrl('/quickstart/', locale.value))
</script>

<template>
  <div class="app-header-wrapper sticky top-0 z-50 bg-default/75 backdrop-blur">
    <UHeader
      v-model:open="headerOpen"
      :to="homePath"
      :ui="{
        root: 'border-0 h-(--ui-topbar-height) bg-transparent! backdrop-blur-none!',
        container: '@container',
        header: 'h-(--ui-topbar-height)',
        toggle: topMenusVisible ? 'hidden!' : 'flex! lg:flex!',
        content: topMenusVisible ? undefined : 'lg:block! lg:h-screen lg:max-h-screen lg:overflow-hidden',
        overlay: topMenusVisible ? undefined : 'lg:block!',
        body: 'max-h-[calc(100vh-var(--ui-topbar-height))] overflow-y-auto overscroll-contain pb-12'
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
          class="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-md cursor-pointer shrink-0 whitespace-nowrap border-0 text-white bg-linear-270 from-15% from-linear-primary to-118% to-primary-light"
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

      <template #content>
        <div class="flex h-screen max-h-screen flex-col overflow-hidden bg-default">
          <div class="flex h-(--ui-topbar-height) shrink-0 items-center justify-between gap-3 border-b border-default px-[50px]">
            <NuxtLink
              :to="homePath"
              class="text-slate-900 dark:text-white"
              @click="headerOpen = false"
            >
              <LogoPro class="w-auto h-10 shrink-0" />
            </NuxtLink>

            <div class="hidden min-w-0 flex-1 items-center justify-center lg:flex">
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
            </div>

            <div class="flex items-center justify-end gap-1.5">
              <NuxtLink
                :to="dashboardUrl"
                target="_blank"
                class="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-md cursor-pointer shrink-0 whitespace-nowrap border-0 text-white bg-linear-270 from-15% from-linear-primary to-118% to-primary-light"
              >
                <UIcon
                  name="ri:dashboard-line"
                  class="size-4"
                />
                <span class="text-sm font-medium hidden 2xl:flex">
                  {{ $t('header.dashboard') }}
                </span>
              </NuxtLink>
              <LanguageSwitcher class="shrink-0" />
              <ColorModeToggle />
              <JoinCommunityButton class="shrink-0 @max-2xl:hidden" />
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                class="-me-1.5"
                @click="headerOpen = false"
              />
            </div>
          </div>

          <div class="overflow-y-auto overscroll-contain p-4 pb-12 sm:p-6">
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
          </div>
        </div>
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
      class="hidden sm:block"
      :items="localizedMenus"
      @visible-change="topMenusVisible = $event"
    />
    <div class="header-bottom-line h-px bg-(--ui-border-muted,#e2e8f0)" />
  </div>
</template>
