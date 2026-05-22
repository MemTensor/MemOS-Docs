<script setup lang="ts">
import mermaid from 'mermaid'

const props = defineProps<{
  code: string
  fontSize?: string
  minWidth?: string
  minHeight?: string
  nodeSpacing?: number
  rankSpacing?: number
  padding?: number
}>()

const container = ref<HTMLElement | null>(null)
const error = ref('')
const status = ref('idle')

async function renderDiagram() {
  if (!container.value) {
    status.value = 'missing-container'
    return
  }

  error.value = ''
  try {
    if (!props.code?.trim()) {
      status.value = 'missing-code'
      error.value = 'Missing Mermaid diagram code'
      return
    }

    status.value = 'rendering'
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'base',
      flowchart: {
        curve: 'basis',
        nodeSpacing: props.nodeSpacing ?? 36,
        rankSpacing: props.rankSpacing ?? 34,
        padding: props.padding ?? 16
      },
      themeVariables: {
        primaryColor: '#EEF2FF',
        primaryTextColor: '#0F172A',
        primaryBorderColor: '#A5B4FC',
        lineColor: '#64748B',
        secondaryColor: '#F8FAFC',
        tertiaryColor: '#FFFFFF',
        fontFamily: 'inherit',
        fontSize: props.fontSize ?? '16px'
      }
    })

    container.value.removeAttribute('data-processed')
    container.value.textContent = props.code
    await mermaid.run({ nodes: [container.value] })
    status.value = 'rendered'
  } catch (err) {
    status.value = 'error'
    error.value = err instanceof Error ? err.message : 'Mermaid render failed'
  }
}

onMounted(async () => {
  await nextTick()
  renderDiagram()
})
watch(() => props.code, renderDiagram)
</script>

<template>
  <div class="my-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div
      ref="container"
      :data-status="status"
      :data-code-length="code?.length || 0"
      class="mermaid-diagram overflow-x-auto"
      :style="{
        '--mermaid-min-width': minWidth || '1080px',
        '--mermaid-min-height': minHeight || '280px',
        '--mermaid-font-size': fontSize || '16px'
      }"
    />

    <pre
      v-if="error"
      class="mt-3 overflow-x-auto rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
    >{{ error }}</pre>
  </div>
</template>

<style scoped>
.mermaid-diagram {
  min-height: var(--mermaid-min-height);
}

.mermaid-diagram :deep(svg) {
  width: auto;
  max-width: none;
  min-width: var(--mermaid-min-width);
  height: auto;
}

.mermaid-diagram :deep(.nodeLabel),
.mermaid-diagram :deep(.edgeLabel),
.mermaid-diagram :deep(foreignObject),
.mermaid-diagram :deep(foreignObject *) {
  font-size: var(--mermaid-font-size) !important;
  line-height: 1.35 !important;
}
</style>
