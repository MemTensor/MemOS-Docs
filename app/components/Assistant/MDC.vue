<script setup lang="ts">
const props = defineProps<{
  value: string
}>()

const ast = ref<any>(null)

watch(() => props.value, async (newVal) => {
  if (!newVal) {
    ast.value = null
    return
  }

  try {
    ast.value = await parseMarkdown(newVal)
  } catch (e) {
    console.error('MDCLive parse error', e)
  }
}, { immediate: true })
</script>

<template>
  <div class="mdc-live relative">
    <MDCRenderer
      v-if="ast"
      :body="ast.body"
      :data="ast.data"
    />
  </div>
</template>
