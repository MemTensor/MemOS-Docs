<script setup lang="ts">
const props = defineProps<{
  title?: string
  desc?: string
}>()

const heading = computed(() => props.title ?? 'API Not Found')
const description = computed(
  () => props.desc ?? 'The requested API documentation does not exist or has not been generated yet.'
)
</script>

<template>
  <div class="w-full">
    <div class="rounded-2xl border border-default bg-background-light p-6">
      <div class="flex items-start gap-4">
        <div
          class="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100/50 dark:bg-white/5 text-gray-700 dark:text-gray-200"
        >
          <UIcon
            name="i-lucide-search-x"
            class="h-5 w-5"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ heading }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
