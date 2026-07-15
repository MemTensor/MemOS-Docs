<script setup lang="ts">
import {
  CHANGELOG_CATEGORIES,
  getOrderedCategories,
  getOrderedProductLines,
  normalizeChangelogVersions,
  type ChangelogCategory,
  type ChangelogCategoryMap,
  type ChangelogProductLine,
  type ChangelogVersion
} from '~/composables/useChangelog'

const { t, locale } = useI18n()

useHead({ title: () => t('changelog.title', '更新日志') })

const { data: releasesData } = await useAsyncData('releases', () => import('../../content/releases.json').then(m => m.default))
const { data: enChangelogData } = await useAsyncData('changelog-en', () => import('../../content/en/changelog.yml').then(m => m.default))
const { data: cnChangelogData } = await useAsyncData('changelog-cn', () => import('../../content/cn/changelog.yml').then(m => m.default))
const { data: enPluginChangelogData } = await useAsyncData('plugin-changelog-en', () => import('../../content/en/plugin-changelog.yml').then(m => m.default))
const { data: cnPluginChangelogData } = await useAsyncData('plugin-changelog-cn', () => import('../../content/cn/plugin-changelog.yml').then(m => m.default))

interface OpenSourceChange {
  type: string
  description: string
  author: string
  pr?: number
  prUrl?: string
}

interface Version {
  name: string
  date: string
  description?: string
  changedInfo: OpenSourceChange[]
  releaseUrl: string
}

interface ChangelogData {
  versions: ChangelogVersion[]
}

type ChangelogUiVersion = ChangelogVersion & {
  ui: {
    container: string
  }
}

interface PluginReleaseCategory {
  category: ChangelogCategory
  changedInfo: string[]
}

interface PluginReleaseGroup {
  key: string
  productName: string
  versionName: string
  title: string
  categories: PluginReleaseCategory[]
}

const changelogData = computed(() => {
  return locale.value === 'cn' ? cnChangelogData.value : enChangelogData.value
})

const pluginChangelogData = computed(() => {
  return locale.value === 'cn' ? cnPluginChangelogData.value : enPluginChangelogData.value
})

const activeTab = ref('0')

const tabs = [
  {
    name: 'highlight',
    label: 'Highlight'
  },
  {
    name: 'plugin',
    label: 'Plugin'
  },
  {
    name: 'opensource',
    label: 'Open Source'
  }
]

const links = computed(() => {
  return [
    {
      label: 'GitHub',
      to: 'https://github.com/MemTensor/MemOS/releases'
    }
  ]
})

interface CategoryIcons {
  [key: string]: string
}

interface CategoryClass {
  [key: string]: string
}

// Icon mapping for different types
const categoryIcons: CategoryIcons = {
  'New Features': 'i-heroicons-sparkles',
  'Improvements': 'i-heroicons-arrow-trending-up',
  'Bug Fixes': 'i-heroicons-bug-ant',
  'feat': 'i-heroicons-sparkles',
  'fix': 'i-heroicons-bug-ant',
  'docs': 'i-heroicons-document-text',
  'style': 'i-heroicons-paint-brush',
  'refactor': 'i-heroicons-code-bracket-square',
  'test': 'i-heroicons-beaker',
  'chore': 'i-heroicons-wrench-screwdriver',
  'ci': 'i-heroicons-cog-6-tooth'
}

const categoryClass: CategoryClass = {
  'New Features': 'text-[#60A5FA]',
  'Improvements': 'text-[#10B981]',
  'Bug Fixes': 'text-[#FB923C]'
}

const allowedOpenSourceTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'ci'
] as const

const getCategoryIcon = (category: string) => {
  if (category.includes('feat')) {
    return 'i-heroicons-sparkles'
  }
  if (category.includes('fix')) {
    return 'i-heroicons-bug-ant'
  }

  return categoryIcons[category] || 'i-heroicons-question-mark-circle'
}

const getCategoryClass = (category: string) => {
  return categoryClass[category] || 'text-[#10B981]'
}

const withTimelineUi = (version: ChangelogVersion): ChangelogUiVersion => ({
  ...version,
  ui: {
    container: 'changelog-version-panel'
  }
})

const highlightVersions = computed<ChangelogUiVersion[]>(() => {
  const data = changelogData.value as unknown as ChangelogData
  return normalizeChangelogVersions(data).map(withTimelineUi)
})

const getProductLineLabel = (line: ChangelogProductLine) => t(`changelog.productLines.${line}`)
const getCategoryLabel = (category: ChangelogCategory) => t(`changelog.categories.${category}`)

const isPluginVersionName = (name: string | undefined) => /^v\d/i.test((name ?? '').trim())

function getPluginProductName(type: string, versionName: string): string {
  const cleanedType = type.replace(/[:：]\s*$/, '').trim()
  const cleanedVersion = versionName.trim()

  if (!isPluginVersionName(cleanedVersion)) return cleanedType

  return cleanedType
    .replace(new RegExp(`[-\\s]*${cleanedVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), '')
    .trim()
}

function getPluginReleaseTitle(productName: string, versionName: string): string {
  const cleanedVersion = versionName.trim()
  if (!isPluginVersionName(cleanedVersion)) return cleanedVersion || productName

  return locale.value === 'cn'
    ? `${productName}-${cleanedVersion}`
    : `${productName} ${cleanedVersion}`
}

function getPluginReleaseGroups(version: ChangelogVersion): PluginReleaseGroup[] {
  const plugin = version.products?.plugin
  if (!plugin) return []

  const groups = new Map<string, PluginReleaseGroup>()

  for (const category of getOrderedCategories(plugin)) {
    for (const item of plugin[category] ?? []) {
      const productName = getPluginProductName(item.type, version.name)
      const key = productName || item.type
      const group = groups.get(key) ?? {
        key,
        productName,
        versionName: isPluginVersionName(version.name) ? version.name : '',
        title: getPluginReleaseTitle(productName, version.name),
        categories: []
      }

      const existingCategory = group.categories.find(entry => entry.category === category)
      if (existingCategory) {
        existingCategory.changedInfo.push(...item.changedInfo)
      } else {
        group.categories.push({
          category,
          changedInfo: [...item.changedInfo]
        })
      }

      groups.set(key, group)
    }
  }

  return Array.from(groups.values())
}

function filterPluginCategories(categories: ChangelogCategoryMap | undefined): ChangelogCategoryMap {
  if (!categories) return {}

  return Object.fromEntries(
    CHANGELOG_CATEGORIES
      .filter(category => (categories[category]?.length ?? 0) > 0)
      .map(category => [category, categories[category]!])
  ) as ChangelogCategoryMap
}

const pluginVersions = computed<ChangelogUiVersion[]>(() => {
  const data = pluginChangelogData.value as unknown as ChangelogData

  // Plugin packages have their own v0.x version line. Do not run the main
  // changelog legacy migration here, otherwise v0.x plugin entries are treated
  // as pre-v2 Highlight entries and their products.plugin data is dropped.
  return (data?.versions ?? [])
    .reduce<ChangelogUiVersion[]>((versions, version) => {
      const plugin = filterPluginCategories(version.products?.plugin)
      if (Object.keys(plugin).length === 0) return versions

      versions.push(withTimelineUi({
        ...version,
        changedInfo: undefined,
        legacy: false,
        products: {
          plugin
        }
      }))

      return versions
    }, [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const opensourceVersions = computed<Version[]>(() => {
  const versions = (releasesData.value?.versions ?? []) as Version[]

  return versions
    .map(version => ({
      ...version,
      changedInfo: version.changedInfo.filter(change =>
        allowedOpenSourceTypes.includes(change.type as (typeof allowedOpenSourceTypes)[number])
      ),
      ui: {
        container: 'changelog-version-panel'
      }
    }))
    .filter(version => version.changedInfo.length > 0)
})

function scrollToChangelogTabs() {
  const tabsEl = document.getElementById('changelog-tabs')
  if (!tabsEl) return

  const scrollContainer = document.getElementById('dashboard-panel-main')
  if (!scrollContainer) {
    tabsEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
    return
  }

  const containerRect = scrollContainer.getBoundingClientRect()
  const tabsRect = tabsEl.getBoundingClientRect()

  scrollContainer.scrollTo({
    top: scrollContainer.scrollTop + tabsRect.top - containerRect.top,
    behavior: 'smooth'
  })
}

function handleTabChange(val: string | number) {
  activeTab.value = val.toString()

  nextTick(() => {
    window.requestAnimationFrame(scrollToChangelogTabs)
  })
}
</script>

<template>
  <UPage class="mb-8">
    <UPageHero
      :title="t('changelog.title')"
      :description="t('changelog.description')"
      class="border-b-[0px] max-w-[100vw]"
    >
      <template #top>
        <div class="absolute z-[-1] rounded-full bg-primary blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-1/2 -translate-y-80" />
      </template>

      <LazyStarsBg />

      <!-- <div aria-hidden="true" class="hidden lg:block absolute z-[-1] border-x border-default inset-0 mx-4 sm:mx-6 lg:mx-8" /> -->
      <template #links>
        <UButton v-for="link of links" :key="link.label" v-bind="{ ...link, size: 'xl' }" />
      </template>
    </UPageHero>

    <UTabs
      id="changelog-tabs"
      v-model="activeTab"
      :items="tabs"
      variant="link"
      class="gap-4 w-full"
      :ui="{ trigger: 'grow' }"
      @update:model-value="handleTabChange"
    >
      <template #default="{ item }">
        {{ item.label }}
      </template>
    </UTabs>

    <UContainer>
      <div class="mt-8">
        <UChangelogVersions
          v-if="activeTab === '0'"
          class="changelog-timeline"
          :versions="highlightVersions"
          :ui="{
            container: 'changelog-container'
          }"
        >
          <template #body="{ version }">
            <div class="changelog-card space-y-8">
              <div class="flex flex-col items-start">
                <span class="text-xl text-slate-900 dark:text-white font-bold">{{ version.name }}</span>
              </div>

              <template v-if="version.legacy">
                <div
                  v-for="category in getOrderedCategories(version.changedInfo ?? {})"
                  :key="category"
                  class="space-y-4"
                >
                  <div
                    class="flex text-base items-center gap-2 font-bold"
                    :class="getCategoryClass(category)"
                  >
                    <UIcon :name="getCategoryIcon(category)" class="w-5 h-5" />
                    {{ getCategoryLabel(category) }}
                  </div>
                  <div
                    v-for="item in version.changedInfo![category]"
                    :key="item.type"
                    class="space-y-2"
                  >
                    <div class="text-l text-slate-900 dark:text-white changelog-info-title">
                      <MDC
                        tag="span"
                        unwrap="p"
                        :value="`${item.type}:`"
                      />
                    </div>
                    <ul class="text-sm list-disc list-inside space-y-1 ml-4">
                      <li
                        v-for="(change, idx) in item.changedInfo"
                        :key="idx"
                        class="text-gray-700 dark:text-gray-300"
                      >
                        <MDC
                          tag="span"
                          unwrap="p"
                          :value="change"
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </template>

              <template v-else>
                <div
                  v-for="productLine in getOrderedProductLines(version.products ?? {})"
                  :key="productLine"
                  class="space-y-5"
                >
                  <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
                    {{ getProductLineLabel(productLine) }}
                  </h3>
                  <div
                    v-for="category in getOrderedCategories(version.products![productLine]!)"
                    :key="category"
                    class="space-y-4 ml-1"
                  >
                    <div
                      class="flex text-base items-center gap-2 font-bold"
                      :class="getCategoryClass(category)"
                    >
                      <UIcon :name="getCategoryIcon(category)" class="w-5 h-5" />
                      {{ getCategoryLabel(category) }}
                    </div>
                    <div
                      v-for="item in version.products![productLine]![category]"
                      :key="item.type"
                      class="space-y-2"
                    >
                      <div class="text-l text-slate-900 dark:text-white changelog-info-title">
                        <MDC
                          tag="span"
                          unwrap="p"
                          :value="`${item.type}:`"
                        />
                      </div>
                      <ul class="text-sm list-disc list-inside space-y-1 ml-4">
                        <li
                          v-for="(change, idx) in item.changedInfo"
                          :key="idx"
                          class="text-gray-700 dark:text-gray-300"
                        >
                          <MDC
                            tag="span"
                            unwrap="p"
                            :value="change"
                          />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>
        </UChangelogVersions>

        <UChangelogVersions
          v-if="activeTab === '1'"
          class="changelog-timeline"
          :versions="pluginVersions"
          :ui="{
            container: 'changelog-container'
          }"
        >
          <template #body="{ version }">
            <div class="changelog-card plugin-changelog-card space-y-6">
              <section
                v-for="group in getPluginReleaseGroups(version)"
                :key="group.key"
                class="plugin-release"
              >
                <header class="plugin-release-header">
                  <div class="min-w-0">
                    <div class="plugin-release-eyebrow">
                      {{ group.productName }}
                    </div>
                    <h2 class="plugin-release-title">
                      {{ group.title }}
                    </h2>
                  </div>
                  <span
                    v-if="group.versionName"
                    class="plugin-version-badge"
                  >
                    {{ group.versionName }}
                  </span>
                </header>

                <div class="space-y-5">
                  <div
                    v-for="entry in group.categories"
                    :key="entry.category"
                    class="plugin-category-block"
                  >
                    <div
                      class="flex text-base items-center gap-2 font-bold"
                      :class="getCategoryClass(entry.category)"
                    >
                      <UIcon :name="getCategoryIcon(entry.category)" class="w-5 h-5" />
                      {{ getCategoryLabel(entry.category) }}
                    </div>
                    <ul class="text-sm list-disc space-y-1.5 ml-5 mt-3">
                      <li
                        v-for="(change, idx) in entry.changedInfo"
                        :key="idx"
                        class="text-gray-700 dark:text-gray-300 leading-7 pl-1"
                      >
                        <MDC
                          tag="span"
                          unwrap="p"
                          :value="change"
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </template>
        </UChangelogVersions>

        <UChangelogVersions
          v-if="activeTab === '2'"
          class="changelog-timeline"
          :versions="opensourceVersions"
          :ui="{
            container: 'changelog-container'
          }"
        >
          <template #body="{ version }">
            <ol class="changelog-card list-decimal list-inside space-y-2 changelog-list">
              <div class="flex flex-col items-start mb-[24px]">
                <span class="text-xl text-slate-900 dark:text-white font-bold">{{ version.name }}</span>
              </div>
              <li v-for="(change, idx) in version.changedInfo" :key="idx" class="flex flex-wrap items-start gap-x-1">
                <span class="text-highlight text-slate-900 dark:text-white font-bold flex items-center gap-2">
                  <UIcon :name="getCategoryIcon(change.type)" class="w-4 h-4 flex-shrink-0" />
                  {{ change.type }}:
                </span>
                <span class="flex-1">{{ change.description }} by @{{ change.author }}
                  <ULink
                    v-if="change.pr"
                    :to="`https://github.com/MemTensor/MemOS/pull/${String(change.pr)}`"
                    target="_blank"
                    class="text-primary-500 hover:text-primary-600 dark:text-primary-400"
                  >(#{{ String(change.pr) }})</ULink>
                </span>
              </li>
            </ol>
          </template>
        </UChangelogVersions>
      </div>
    </UContainer>

    <StarsBg />
  </UPage>
</template>

<style scoped>
:deep(.changelog-timeline) {
  margin-inline: auto;
  width: min(100%, 72rem);
}

:deep(.changelog-container article) {
  max-width: 100% !important;
}

:deep(.changelog-version-panel) {
  width: 100%;
  max-width: 100% !important;
}

@media (min-width: 1024px) {
  :deep(.changelog-version-panel) {
    margin-left: 11.25rem !important;
    margin-right: auto !important;
    max-width: min(64rem, calc(100% - 12.75rem)) !important;
  }
}

@media (min-width: 1280px) {
  :deep(.changelog-version-panel) {
    margin-left: 11.75rem !important;
    max-width: min(66rem, calc(100% - 13.25rem)) !important;
  }
}

.changelog-card {
  border: 1px solid rgb(226 232 240 / 0.8);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.08);
  padding: 1.25rem 1.25rem 1rem;
}

.dark .changelog-card {
  border-color: rgb(148 163 184 / 0.18);
  background: linear-gradient(160deg, rgb(8 13 25 / 0.96), rgb(5 8 18 / 0.96));
  box-shadow: none;
}

.changelog-card :deep(strong) {
  font-weight: 700;
  color: rgb(15 23 42);
}

.dark .changelog-card :deep(strong) {
  color: #fff;
}

.changelog-card :deep(code) {
  border-radius: 0.375rem;
  background: rgb(241 245 249 / 0.9);
  padding: 0.1rem 0.3rem;
  color: rgb(51 65 85);
  font-size: 0.875em;
}

.dark .changelog-card :deep(code) {
  background: rgb(30 41 59 / 0.9);
  color: rgb(226 232 240);
}

.changelog-list {
  counter-reset: changelog;
}

.changelog-info {
  padding: 1rem;
}

.plugin-changelog-card {
  padding: 1.5rem;
}

.plugin-release + .plugin-release {
  border-top: 1px solid rgb(226 232 240 / 0.8);
  padding-top: 1.5rem;
}

.dark .plugin-release + .plugin-release {
  border-top-color: rgb(148 163 184 / 0.18);
}

.plugin-release-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgb(226 232 240 / 0.8);
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
}

.dark .plugin-release-header {
  border-bottom-color: rgb(148 163 184 / 0.18);
}

.plugin-release-eyebrow {
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.08em;
  color: rgb(99 102 241);
}

.plugin-release-title {
  color: rgb(15 23 42);
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.3;
}

.dark .plugin-release-title {
  color: #fff;
}

.plugin-version-badge {
  flex: none;
  border: 1px solid rgb(99 102 241 / 0.28);
  background: rgb(238 242 255 / 0.9);
  border-radius: 999px;
  color: rgb(67 56 202);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  padding: 0.45rem 0.7rem;
}

.dark .plugin-version-badge {
  border-color: rgb(129 140 248 / 0.32);
  background: rgb(49 46 129 / 0.32);
  color: rgb(199 210 254);
}

.plugin-category-block {
  border-radius: 0.875rem;
}

.changelog-list {
  padding: 1.25rem;
}
.changelog-list li {
  margin-bottom: 1rem;
  line-height: 1.6;
}
.changelog-list li:last-child {
  margin-bottom: 0;
}
</style>
