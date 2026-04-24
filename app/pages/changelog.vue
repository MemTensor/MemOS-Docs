<script setup lang="ts">
import releasesData from '../../content/releases.json'
import enChangelogData from '../../content/en/changelog.yml'
import cnChangelogData from '../../content/cn/changelog.yml'

const { t, locale } = useI18n()

interface ChangelogItem {
  type: string
  changedInfo: string[]
}

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

interface ChangelogVersion {
  name: string
  date: string
  changedInfo: {
    [key: string]: ChangelogItem[]
  }
}

interface ChangelogData {
  versions: ChangelogVersion[]
}

// Get changelog data based on current language
const changelogData = computed(() => {
  return locale.value === 'cn' ? cnChangelogData : enChangelogData
})

const activeTab = ref('0')

const tabs = [
  {
    name: 'highlight',
    label: 'Highlight'
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
    },
    {
      label: t('changelog.releaseNotes'),
      target: '_blank',
      variant: 'outline' as const,
      color: 'neutral' as const,
      to: 'https://alidocs.dingtalk.com/i/nodes/MyQA2dXW7ebBrQAbF6ReovdrJzlwrZgb'
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

// Transform changelog data to match ChangelogVersions component format
const highlightVersions = computed(() => {
  const data = changelogData.value as unknown as ChangelogData
  return data.versions.map(version => ({
    ...version,
    // Keep original structure for display
    changedInfo: version.changedInfo,
    ui: {
      container: 'max-w-3xl'
    }
  }))
})

const opensourceVersions = computed<Version[]>(() => {
  const versions = releasesData.versions as Version[]

  return versions
    .map(version => ({
      ...version,
      changedInfo: version.changedInfo.filter(change =>
        allowedOpenSourceTypes.includes(change.type as (typeof allowedOpenSourceTypes)[number])
      ),
      ui: {
        container: 'max-w-3xl'
      }
    }))
    // 过滤掉没有符合类型的版本
    .filter(version => version.changedInfo.length > 0)
})

function handleTabChange(val: string | number) {
  if (val === '2') {
    return
  }

  activeTab.value = val.toString()
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
          :versions="highlightVersions"
          :ui="{
            container: 'changelog-container'
          }"
        >
          <template #body="{ version }">
            <div class="space-y-6 changelog-info rounded-lg">
              <div class="flex flex-col items-start">
                <span class="text-xl text-white font-bold">{{ version.name }}</span>
              </div>
              <div v-for="(items, category) in version.changedInfo" :key="String(category)" class="space-y-4">
                <div class="flex text-lg items-center gap-2 font-medium font-bold text-[#10B981]" :class="getCategoryClass(String(category))">
                  <UIcon :name="getCategoryIcon(String(category))" class="w-5 h-5" />
                  {{ category }}
                </div>
                <div v-for="item in items" :key="item.type" class="space-y-2">
                  <div class="text-l text-white flex items-center gap-2 changelog-info-title">
                    {{ item.type }}:
                  </div>
                  <ul class="text-sm list-disc list-inside space-y-1 ml-4">
                    <li v-for="(change, idx) in item.changedInfo" :key="idx" class="text-gray-700 dark:text-gray-300">
                      {{ change }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>
        </UChangelogVersions>

        <UChangelogVersions
          v-if="activeTab === '1'"
          :versions="opensourceVersions"
          :ui="{
            container: 'changelog-container'
          }"
        >
          <template #body="{ version }">
            <ol class="list-decimal list-inside space-y-2 changelog-list">
              <div class="flex flex-col items-start mb-[24px]">
                <span class="text-xl text-white font-bold">{{ version.name }}</span>
              </div>
              <li v-for="(change, idx) in version.changedInfo" :key="idx" class="flex flex-wrap items-start gap-x-1">
                <span class="text-highlight text-white font-bold flex items-center gap-2">
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
.changelog-container :deep(article) {
  max-width: var(--container-3xl) !important;
}
.changelog-list {
  counter-reset: changelog;
}

.changelog-info {
  /* background: var(--ui-bg-muted); */
  padding: 1rem;
}

.changelog-list {
  padding: 1rem;
  /* background: var(--ui-bg-muted);
  border-radius: 0.5rem; */
}
.changelog-list li {
  margin-bottom: 1rem;
  line-height: 1.6;
}
.changelog-list li:last-child {
  margin-bottom: 0;
}
</style>
