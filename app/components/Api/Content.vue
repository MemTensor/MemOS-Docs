<script setup lang="ts">
const props = withDefaults(defineProps<{
  apiData: any
  showRequestCode?: boolean
  showSurround?: boolean
}>(), {
  showRequestCode: false,
  showSurround: true
})

const collectionName = inject<CollectionName>('collectionName')
const normalizeName = computed(() => {
  return props.apiData?.path?.replace(/^\//, '').replace(/\//g, '_')
})

const sidebarRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const isSticky = ref(true)
const sidebarTop = ref(0)

const sidebarStyle = computed(() => {
  return {
    top: `${sidebarTop.value}px`
  }
})

const handleScroll = () => {
  if (!sidebarRef.value || !contentRef.value) return

  const contentRect = contentRef.value.getBoundingClientRect()
  const sidebarRect = sidebarRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const stickyTop = 80

  const contentBottom = contentRect.bottom + 32
  const sidebarBottomWhenSticky = stickyTop + sidebarRect.height

  if (sidebarBottomWhenSticky <= viewportHeight) {
    const shouldStick = contentBottom >= sidebarBottomWhenSticky
    isSticky.value = shouldStick
    sidebarTop.value = shouldStick ? 40 : contentRect.height - sidebarRect.height
  } else {
    if (sidebarRect.bottom > viewportHeight) {
      isSticky.value = false
      sidebarTop.value = 0
    } else if (contentBottom > viewportHeight) {
      isSticky.value = true
      sidebarTop.value = viewportHeight - sidebarBottomWhenSticky
    } else {
      isSticky.value = false
      sidebarTop.value = contentRect.height - sidebarRect.height
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="flex flex-col box-border w-full relative grow mx-auto max-w-xl 2xl:max-w-2xl xl:w-[calc(100%-28rem)]">
    <div ref="contentRef">
      <header class="relative">
        <h1 class="inline-block text-2xl sm:text-3xl text-gray-900 tracking-tight dark:text-gray-200 font-semibold">
          {{ apiData?.summary }}
        </h1>
        <div class="mt-2 text-lg">
          <p
            class="text-gray-600 dark:text-gray-400 text-base"
            v-html="apiData?.description"
          />
        </div>
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
    ref="sidebarRef"
    :class="[
      'hidden xl:flex self-start xl:flex-col max-w-[28rem] h-fit',
      isSticky ? 'sticky h-[calc(100vh-4rem)]' : 'relative'
    ]"
    :style="sidebarStyle"
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
:deep(.shiki) {
  max-height: 420px;
}
</style>
