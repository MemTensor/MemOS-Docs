<script setup lang="ts">
defineProps<{
  value: unknown
}>()
</script>

<template>
  <div
    v-if="value !== undefined && value !== null"
    class="flex items-center mt-6 gap-1.5 text-sm text-gray-600 dark:text-gray-400"
  >
    <span>Example: </span>
    <div class="flex items-center px-2 py-0.5 rounded-md bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-200 font-medium text-sm break-all">
      {{ typeof value === 'string' ? `"${value}"` : value }}
    </div>
  </div>
</template>
