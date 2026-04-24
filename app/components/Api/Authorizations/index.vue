<script setup lang="ts">
const props = defineProps<{
  path: string
  method: HttpMethods
}>()

const collectionName = inject<CollectionName>('collectionName')
const { getSecurityWithTypes } = useOpenApi(collectionName)

const securitys = computed<SecurityProps[]>(() => {
  return getSecurityWithTypes(props.path, props.method)
})
</script>

<template>
  <div
    v-if="securitys && securitys.length"
    class="mdx-content relative mt-8"
  >
    <ApiSectionHeader title="Authorizations" />
    <template
      v-for="(security, index) in securitys"
      :key="index"
    >
      <div
        v-if="security && security.scheme"
        class="py-6"
      >
        <div class="flex font-mono text-sm break-all relative">
          <div class="flex items-center flex-wrap gap-2">
            <div class="font-semibold text-primary dark:text-primary-light cursor-pointer overflow-wrap-anywhere">
              <span>{{ security.scheme.name }}</span>
            </div>
            <div class="inline items-center gap-2 text-xs font-medium [&_div]:inline [&_div]:mr-2 [&_div]:leading-5">
              <div class="flex items-center px-2 py-0.5 rounded-md bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-200 font-medium break-all">
                <span>string</span>
              </div>
              <div class="flex items-center px-2 py-0.5 rounded-md bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-200 font-medium break-all">
                <span>{{ security.scheme.in }}</span>
              </div>
              <div class="px-2 py-0.5 rounded-md bg-red-100/50 dark:bg-red-400/10 text-red-600 dark:text-red-300 font-medium whitespace-nowrap">
                <span>required</span>
              </div>
            </div>
          </div>
        </div>
        <template v-if="security.scheme.description">
          <p
            class="mt-4 whitespace-pre-line text-gray-600 dark:text-gray-400 text-sm"
            v-html="security.scheme.description"
          />
        </template>
      </div>
    </template>
  </div>
</template>
