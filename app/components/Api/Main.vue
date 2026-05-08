<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

defineProps<{
  data: FlatPathProps | undefined
}>()
</script>

<template>
  <div class="relative flex w-full min-w-0 flex-nowrap items-start gap-x-[2.1rem] pt-10 lg:pt-10">
    <ApiContent
      v-if="data"
      v-bind="$attrs"
      :api-data="data"
    >
      <template #markdown>
        <slot name="markdown" />
      </template>
    </ApiContent>
    <ApiNotFound v-else />
  </div>
</template>
