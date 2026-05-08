<script setup lang="ts">
import { codeToHtml } from 'shiki'

const props = defineProps<{
  code: string
  language: 'python' | 'bash' | 'json' | undefined
}>()
const colorMode = useColorMode()

const highlightCode = ref<string>('')
await generateHighlight()

watchEffect(() => {
  generateHighlight()
})

async function generateHighlight() {
  if (props.code && props.language) {
    const highlightHtml = await codeToHtml(props.code, {
      lang: props.language,
      theme: colorMode.value === 'dark' ? 'github-dark-default' : 'github-light-high-contrast'
    })

    highlightCode.value = highlightHtml
  }
}
</script>

<template>
  <div v-html="highlightCode" />
</template>

<style lang="css" scoped>
:deep(.shiki) {
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.shiki code) {
  background: transparent !important;
}

:deep(.shiki span.line) {
  display: inline-block !important;
}
</style>
