<script setup lang="ts">
const props = defineProps<{
  path: string
  method: HttpMethods
}>()

const collectionName = inject<CollectionName>('collectionName')
const {
  getResponseStatusCodes,
  getResponseByStatusCode,
  getResponseContentTypes,
  getResponseAsJSONSchema
} = useOpenApi(collectionName)

const statusCodes = computed(() => {
  return getResponseStatusCodes(props.path, props.method)
})

const currentCode = ref<string>('200')
const currentContentType = ref<string>('')

const contentTypes = computed(() => {
  if (!currentCode.value) return []
  return getResponseContentTypes(props.path, props.method, currentCode.value)
})

watch(contentTypes, (newTypes) => {
  if (newTypes.length > 0 && (!currentContentType.value || !newTypes.includes(currentContentType.value))) {
    currentContentType.value = newTypes[0]!
  }
}, { immediate: true })

const selectedResponse = computed(() => {
  if (!currentCode.value) return null
  return getResponseByStatusCode(props.path, props.method, currentCode.value)
})

const selectedSchema = computed(() => {
  if (!currentCode.value) return null
  return getResponseAsJSONSchema(props.path, props.method, currentCode.value, currentContentType.value)
})
</script>

<template>
  <div
    v-if="statusCodes.length > 0"
    class="api-section"
  >
    <div class="flex flex-col gap-y-4 w-full">
      <ApiSectionHeader :title="$t('api.response')">
        <template #right>
          <div class="flex items-center gap-4 font-mono px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
            <USelect
              v-model="currentCode"
              :items="statusCodes"
              :ui="{
                base: 'text-xs',
                item: 'text-xs'
              }"
            />
            <USelect
              v-if="contentTypes.length > 1"
              v-model="currentContentType"
              :items="contentTypes"
              :ui="{
                base: 'text-xs'
              }"
            />
            <span v-else>{{ currentContentType }}</span>
          </div>
        </template>
      </ApiSectionHeader>
      <div
        v-if="selectedResponse"
        class="text-sm prose prose-gray dark:prose-invert mb-2"
      >
        <p
          v-if="selectedResponse.description"
          class="whitespace-pre-line text-gray-600 dark:text-gray-400"
        >
          {{ selectedResponse.description }}
        </p>
      </div>
    </div>
    <div v-if="selectedSchema">
      <div
        v-if="selectedSchema?.description"
        class="pt-6 pb-4"
      >
        <p class="whitespace-pre-line text-gray-600 dark:text-gray-400 text-sm">
          {{ selectedSchema?.description }}
        </p>
      </div>
      <template v-if="selectedSchema.properties">
        <template
          v-for="(item, prop) in selectedSchema.properties"
          :key="prop"
        >
          <div class="border-gray-100 dark:border-gray-800 border-b last:border-b-0">
            <div class="py-6">
              <ApiParameterLine
                :name="prop"
                :required="selectedSchema?.required?.includes(prop)"
                :default-value="item.default"
                :schema="item"
              />
              <div class="mt-4">
                <p
                  v-if="item.description"
                  class="whitespace-pre-line text-gray-600 dark:text-gray-400 text-sm"
                  v-html="item.description"
                />
                <ApiResponseSubItem
                  v-if="item.properties"
                  :item="item"
                />
                <ApiResponseSubItem
                  v-else-if="item.items"
                  :item="item.items"
                />
                <template v-else>
                  <div
                    v-if="item.example !== undefined && item.example !== null"
                    class="flex mt-6 gap-1.5 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>Example: </span>
                    <span class="flex items-center px-2 py-0.5 rounded-md bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-200 font-medium text-sm break-all">
                      {{ typeof item.example === 'string' ? `"${item.example}"` : item.example }}
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
