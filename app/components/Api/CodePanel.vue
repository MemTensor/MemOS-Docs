<script setup lang="ts">
import type { JSONValue } from '@/utils/jsonHighlight'
import { renderHighlightedJson } from '@/utils/jsonHighlight'

type JSONValueLocal = JSONValue

interface SchemaLike {
  type?: string
  title?: string
  properties?: Record<string, SchemaLike>
  items?: SchemaLike
  example?: JSONValueLocal
  default?: JSONValueLocal
  enum?: JSONValueLocal[]
  anyOf?: SchemaLike[]
  oneOf?: SchemaLike[]
  allOf?: SchemaLike[]
}

interface ResponseItem {
  statusCode: string
  description?: string
  contentType?: string
  data?: SchemaLike
}
const props = defineProps<{
  responses: ResponseItem[]
}>()

const active = ref<number>(0)

function pickSchema(s: SchemaLike | undefined): SchemaLike | undefined {
  if (!s) return s
  if (s.anyOf && s.anyOf.length) return pickSchema(s.anyOf[0])
  if (s.oneOf && s.oneOf.length) return pickSchema(s.oneOf[0])
  if (s.allOf && s.allOf.length) {
    return s.allOf.reduce((acc: SchemaLike, cur: SchemaLike) => ({ ...acc, ...pickSchema(cur) }), {} as SchemaLike)
  }
  return s
}

function jsonFromSchema(schema: SchemaLike | undefined, seen = new Set<SchemaLike>()): JSONValueLocal {
  const s = pickSchema(schema) || {}

  if (s.example !== undefined) return s.example
  if (s.default !== undefined) return s.default

  if (seen.has(s as SchemaLike)) return null
  seen.add(s as SchemaLike)

  const t = s.type
  if (t === 'object' || (s.properties && !t)) {
    const obj: Record<string, JSONValueLocal> = {}
    const props = s.properties || {}
    for (const key of Object.keys(props)) {
      obj[key] = jsonFromSchema(props[key], seen)
    }
    return obj
  }
  if (t === 'array') {
    const itemSchema = pickSchema(s.items) || { type: 'any' }
    return [jsonFromSchema(itemSchema, seen)]
  }
  if (t === 'integer' || t === 'number') return '<number>'
  if (t === 'boolean') return '<boolean>'
  if (t === 'null') return null
  if (t === 'string') return '<string>'
  if (s.enum && s.enum.length) return s.enum[0]
  // default to string
  return typeof s.title === 'string' ? s.title : '<any>'
}

const exampleObjects = computed<JSONValueLocal[]>(() => props.responses.map(r => jsonFromSchema(r?.data)))
const highlightedExamples = computed<string[]>(() => exampleObjects.value.map(obj => renderHighlightedJson(obj, 0)))
const plainJsonStrings = computed<string[]>(() => exampleObjects.value.map(obj => JSON.stringify(obj, null, 2)))

function handleClick(index: number) {
  active.value = index
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(plainJsonStrings.value[active.value] || '')
  } catch {
    // ignore
  }
}
</script>

<template>
  <div class="code-block relative group my-5 w-full xl:w-[28rem] max-h-[calc(100%-32px)] min-h-[18rem]">
    <div class="relative flex items-center justify-between gap-2 rounded-t-md border border-muted border-b-0 bg-default px-3 py-2">
        <div class="flex-1 min-w-0 text-xs leading-6 gap-1 flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-black/15 hover:scrollbar-thumb-black/20 active:scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20 dark:hover:scrollbar-thumb-white/25 dark:active:scrollbar-thumb-white/25">
          <button
            v-for="(res, index) in responses"
            :key="res.statusCode"
            class="relative inline-flex items-center gap-1.5 text-default hover:bg-elevated/50 px-2 py-1.5 text-sm rounded-md cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus:outline-none transition-colors"
            :class="active === index ? 'bg-elevated text-highlighted' : ''"
            @click="handleClick(index)"
          >
            <span class="truncate">{{ res.statusCode }}</span>
          </button>
        </div>
        <button
          class="cursor-pointer"
          @click="handleCopy"
        >
          <UIcon
            name="i-lucide-copy"
            class="text-gray-400"
          />
        </button>
      </div>
      <div class="group overflow-x-auto rounded-md rounded-t-none border border-muted bg-muted px-4 py-3 font-mono text-sm/6 break-words whitespace-pre-wrap focus:outline-none">
        <div class="min-w-full [&_pre]:!m-0 [&_pre]:bg-transparent! [&_pre]:p-0!">
          <div class="font-mono whitespace-pre flex-none h-full text-xs leading-[1.35rem]">
            <pre><code v-html="highlightedExamples[active]" /></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
