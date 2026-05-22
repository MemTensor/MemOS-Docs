<script setup lang="ts">
interface ItemProps {
  title: string
  description: string
}

interface HomeRouteItem {
  to: string
  icon: string
}

const { t, rt, tm } = useI18n()
const localePath = useLocalePath()
const localeItems = computed(() => tm('homepage.items') as ItemProps[])

useHead({ title: () => t('homepage.title') })
const rawItems: HomeRouteItem[] = [
  { to: '/memos_cloud/introduction/mem_production', icon: 'i-ri-brain-line' },
  { to: '/memos_cloud/getting_started/quick_start', icon: 'i-ri-file-cloud-fill' },
  { to: '/open_source/getting_started/installation', icon: 'i-ri-open-source-fill' },
  { to: '/usecase/knowledge_qa_assistant', icon: 'i-ri-book-read-fill' },
  { to: '/mcp_agent/mcp/guide', icon: 'material-symbols:switch-access-3' },
  { to: '/api_docs/start/overview', icon: 'ant-design:api-filled' }
]
const items = computed(() => localeItems.value.map((item, index) => ({
  title: rt(item.title),
  description: rt(item.description),
  ...rawItems[index],
  to: localePath(rawItems[index]?.to || '/')
})))
</script>

<template>
  <UMain class="max-w-(--ui-max-container) mx-auto">
    <UPageHero
      :description="$t('homepage.description')"
      :ui="{
        container: 'pt-[38px]! pb-[38px]! max-w-[92%]! xl:max-w-[1120px]! mx-auto! px-4 sm:px-6 lg:px-0!',
        header: 'pt-0',
        title: 'text-2xl leading-8.5 sm:text-3xl sm:leading-10.5 lg:text-4xl lg:leading-12.5 font-black [-webkit-text-stroke:0.22px_currentColor] [paint-order:stroke_fill]',
        description: 'text-sm leading-4.5 sm:text-sm sm:leading-5 lg:text-base lg:leading-5.5 mt-1.5 sm:mt-2',
        footer: 'mt-6 sm:mt-8',
        links: 'gap-x-6 gap-y-3 sm:gap-x-8 sm:gap-y-4'
      }"
    >
      <template #title>
        <span class="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-balance">
          <span>{{ $t('homepage.titlePrefix') }}</span>
          <LogoWordmark />
          <span>{{ $t('homepage.titleSuffix') }}</span>
        </span>
      </template>
      <template #links>
        <BaseButton
          type="primary"
          trailing-icon="i-ri-arrow-right-line"
          :to="localePath('/memos_cloud/getting_started/quick_start')"
        >
          {{ $t('homepage.buttonText') }}
        </BaseButton>
        <BaseButton
          type="default"
          trailing-icon="i-ri-arrow-right-line"
          :to="localePath('/openclaw/guide')"
        >
          {{ $t('homepage.openclawButton') }}
        </BaseButton>
      </template>
    </UPageHero>
    <div class="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-12 max-w-[92%] xl:max-w-[1020px] mx-auto px-4 sm:px-6 lg:px-0">
      <UPageCard
        v-for="(item, index) in items"
        :key="index"
        spotlight
        spotlight-color="primary"
        :class="[
          'group h-full',
          'xl:col-span-4',
          index === items.length - 2 && items.length === 5 ? 'xl:col-start-3' : '',
          index === items.length - 1 && items.length === 5 ? 'xl:col-start-7' : ''
        ]"
        :ui="{
          root: 'rounded-2xl h-full flex flex-col overflow-hidden',
          container: 'gap-y-0 flex h-full min-h-0 flex-1 flex-col !p-0'
        }"
        :to="item.to"
      >
        <div class="flex min-h-0 flex-1 flex-col">
          <div
            class="card-icon-area flex shrink-0 items-center justify-center bg-indigo-50 bg-cover dark:bg-[#171823] h-40 dark:bg-[url(https://cdn.memtensor.com.cn/img/1766476630033_bbjhot_compressed.png)] dark:group-hover:bg-[url(https://cdn.memtensor.com.cn/img/1766476753478_f7b4hm_compressed.png)]"
          >
            <UIcon
              :name="item.icon!"
              class="relative z-10 size-10 bg-linear-270 from-15% from-linear-primary to-118% to-primary-light"
            />
          </div>
          <div class="flex min-h-0 flex-1 flex-col justify-start gap-1 px-4 py-3.5">
            <div class="text-slate-900 dark:text-slate-50 text-sm font-bold lg:text-base">
              {{ item.title }}
            </div>
            <div class="text-slate-600 dark:text-slate-400 text-sm leading-6">
              {{ item.description }}
            </div>
          </div>
        </div>
      </UPageCard>
    </div>
  </UMain>
</template>

<style scoped>
.card-icon-area {
  position: relative;
}

.card-icon-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgb(148 163 184 / 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(148 163 184 / 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

:root.dark .card-icon-area::before {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.02) 1px, transparent 1px);
}
</style>
