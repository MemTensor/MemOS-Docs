<script setup lang="ts">
defineProps<{
  description: string | undefined
}>()
</script>

<template>
  <p
    v-if="description"
    class="whitespace-pre-line text-gray-600 dark:text-gray-400 text-sm"
  >
    {{ description }}
  </p>
</template>
