<script setup lang="ts">
interface ItemProps {
  title: string
  description: string
}

const { rt, tm } = useI18n()
const localeItems = computed(() => tm('homepage.items') as ItemProps[])
const rawItems = [
  { to: '/memos_cloud/overview', icon: 'ri:file-cloud-fill' },
  { to: '/open_source/getting_started/installation', icon: 'ri:open-source-fill' },
  { to: '/self_developed_model/extraction_usage_example', icon: 'ri:cpu-line' },
  { to: '/mcp_agent/mcp/guide', icon: 'material-symbols:switch-access-3' },
  { to: '/api_docs/start/overview', icon: 'ant-design:api-filled' },
  { to: '/usecase/financial_assistant', icon: 'ri:book-read-fill' }
]
const items = computed(() => localeItems.value.map((item, index) => ({
  title: rt(item.title),
  description: rt(item.description),
  ...rawItems[index]
})))
</script>

<template>
  <UMain class="max-w-(--ui-max-container) mx-auto">
    <UPageHero
      :title="$t('homepage.title')"
      :description="$t('homepage.description')"
      :ui="{
        container: 'pt-20! pb-15!',
        title: 'text-2xl leading-8.5 sm:text-3xl sm:leading-10.5 lg:text-4xl lg:leading-12.5 font-black',
        description: 'text-sm leadig-4.5 sm:text-sm sm:leading-5 lg:text-base lg:leading-5.5 mt-3',
        footer: 'mt-8'
      }"
    >
      <template #links>
        <BaseButton
          type="primary"
          trailing-icon="ri:arrow-right-line"
          to="/memos_cloud/overview"
        >
          {{ $t('homepage.buttonText') }}
        </BaseButton>
        <BaseButton
          trailing-icon="ri:arrow-right-line"
          to="/openclaw/guide"
        >
          {{ $t('homepage.openclawButton') }}
        </BaseButton>
      </template>
    </UPageHero>
    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-12 max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-0">
      <UPageCard
        v-for="(item, index) in items"
        :key="index"
        spotlight
        spotlight-color="primary"
        :class="[
          'group',
          'xl:col-span-4',
          index === items.length - 2 && items.length === 5 ? 'xl:col-start-3' : '',
          index === items.length - 1 && items.length === 5 ? 'xl:col-start-7' : ''
        ]"
        :ui="{
          root: 'rounded-[20px]',
          container: 'gap-y-0'
        }"
        :to="item.to"
      >
        <div
          class="flex items-center justify-center h-40 bg-[#171823] bg-cover rounded-xl mb-8 bg-[url(https://cdn.memtensor.com.cn/img/1766476630033_bbjhot_compressed.png)] group-hover:bg-[url(https://cdn.memtensor.com.cn/img/1766476753478_f7b4hm_compressed.png)]"
        >
          <UIcon
            :name="item.icon!"
            class="size-14 bg-linear-270 from-15% from-linear-primary to-118% to-primary-light"
          />
        </div>
        <div class="text-slate-50 text-base lg:text-xl font-bold mb-5">
          {{ item.title }}
          <div class="h-1 w-15 mt-2 bg-linear-270 from-15% from-linear-primary to-118% to-primary-light" />
        </div>
        <div class="text-slate-400 leading-7">
          {{ item.description }}
        </div>
      </UPageCard>
    </div>
    <AppFooter class="mt-28.5" />
  </UMain>
</template>
