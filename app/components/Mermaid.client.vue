<script setup lang="ts">
import mermaid from 'mermaid'

const props = defineProps<{ code: string }>()

const colorMode = useColorMode()
const svg = ref('')
const error = ref('')
let seq = 0

async function render() {
  const code = (props.code || '').trim()
  if (!code) {
    svg.value = ''
    return
  }
  try {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: colorMode.value === 'dark' ? 'dark' : 'default'
    })
    error.value = ''
    const { svg: out } = await mermaid.render(`mermaid-${Date.now()}-${seq++}`, code)
    // mermaid 默认把 svg 的 max-width 设成"自然宽度"，在内容区里显得偏小；
    // 去掉该限制，交给下方 CSS 让其按容器宽度自适应放大（viewBox 保证比例不变）。
    svg.value = out.replace(/max-width:\s*[\d.]+px/g, 'max-width: 100%')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    svg.value = ''
  }
}

onMounted(render)
watch(() => [props.code, colorMode.value], render)
</script>

<template>
  <div class="not-prose my-6 overflow-x-auto">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-if="svg"
      class="mermaid-svg"
      v-html="svg"
    />
    <pre v-else-if="error" class="text-error text-sm whitespace-pre-wrap">{{ error }}</pre>
  </div>
</template>

<style>
.mermaid-svg svg {
  width: 100%;
  height: auto;
  max-width: 100%;
}
</style>
