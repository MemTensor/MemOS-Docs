<script setup lang="ts">
const props = withDefaults(defineProps<{
  apiData: any
  headline?: string
  showRequestCode?: boolean
  showSurround?: boolean
}>(), {
  headline: '',
  showRequestCode: false,
  showSurround: true
})

const collectionName = inject<CollectionName>('collectionName')
const normalizeName = computed(() => {
  return props.apiData?.path?.replace(/^\//, '').replace(/\//g, '_')
})

</script>

<template>
  <div class="relative box-border flex w-full min-w-0 flex-col xl:mx-[18.4062px] xl:w-[520px] xl:min-w-[520px] xl:max-w-[520px] xl:flex-none xl:shrink-0">
    <div>
      <header class="relative flex flex-col items-start">
        <!-- 不用 div：全局 main.css 里 header>div 会强制左右 10px padding，章节标题需与 h1 左对齐 -->
        <span
          v-if="headline"
          class="mb-2 block w-full text-left text-sm font-medium text-primary"
        >
          {{ headline }}
        </span>
        <h1 class="block w-full text-left text-2xl sm:text-3xl text-gray-900 tracking-tight dark:text-gray-200 font-semibold">
          {{ apiData?.summary }}
        </h1>
        <p
          class="mt-2 m-0 w-full text-left text-base leading-7 text-gray-600 dark:text-gray-400"
          v-html="apiData?.description"
        />
      </header>
      <ApiPath
        :path="apiData?.path"
        :method="apiData?.method"
      />
      <div class="xl:hidden mt-6">
        <template v-if="showRequestCode">
          <CodeSnippet
            v-if="collectionName === 'dashboardApi' && normalizeName"
            :name="normalizeName"
            class="request-display"
          />
          <ApiCodeRequest
            v-else-if="apiData?.requestBody"
            :path="apiData?.path"
            :method="apiData?.method"
          />
        </template>
        <ApiCodeResponse
          v-if="apiData?.responses"
          :path="apiData?.path"
          :method="apiData?.method"
        />
      </div>
      <div class="mdx-content relative mt-8 mb-8 prose prose-gray dark:prose-invert">
        <ApiAuthorizations
          :path="apiData?.path"
          :method="apiData?.method"
        />
        <ApiParameter
          :path="apiData?.path"
          :method="apiData?.method"
        />
        <ApiRequestBody
          :path="apiData?.path"
          :method="apiData?.method"
        />
        <ApiResponse
          v-if="apiData?.responses"
          :path="apiData?.path"
          :method="apiData?.method"
        />
      </div>
    </div>
    <slot name="markdown" />
    <ApiSurround v-if="showSurround" />
  </div>
  <div
    class="hidden w-full max-w-[28rem] shrink-0 xl:flex xl:h-fit xl:self-start xl:sticky xl:top-[var(--ui-header-height,0px)] xl:max-h-none xl:flex-col xl:overflow-hidden"
  >
    <template v-if="showRequestCode">
      <CodeSnippet
        v-if="collectionName === 'dashboardApi' && normalizeName"
        :name="normalizeName"
        class="request-display"
      />
      <ApiCodeRequest
        v-else-if="apiData?.requestBody"
        :path="apiData?.path"
        :method="apiData?.method"
      />
    </template>
    <ApiCodeResponse
      v-if="apiData?.responses"
      :path="apiData?.path"
      :method="apiData?.method"
    />
  </div>
</template>

<style lang="css" scoped>
@media (min-width: 1280px) {
  :deep(.request-display),
  :deep(.code-block) {
    margin-top: 0.75rem !important;
    margin-bottom: 0.75rem !important;
  }

  :deep(.request-display pre[role="tabpanel"]),
  :deep(.code-block > div:last-child) {
    max-height: clamp(10rem, calc((100vh - var(--ui-header-height, 0px) - 12rem) / 2), 13.5rem);
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  :deep(.request-display pre[role="tabpanel"]::-webkit-scrollbar),
  :deep(.code-block > div:last-child::-webkit-scrollbar) {
    display: none;
  }
}

:deep(.shiki) {
  max-height: none;
}
</style>
