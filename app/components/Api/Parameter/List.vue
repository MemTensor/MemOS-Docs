<script setup lang="ts">
defineProps<{
  title: string
  params: ParameterObject[]
}>()

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <div v-if="params && params.length">
    <ApiSectionHeader :title="title" />
    <template
      v-for="(param, index) in params"
      :key="index"
    >
      <div class="border-gray-100 dark:border-gray-800 border-b last:border-b-0">
        <div class="py-6">
          <ApiParameterLine
            v-bind="$attrs"
            :name="param.name"
            :required="param.required"
            :schema="param.schema as SchemaObject"
            :in="(param.in as 'query' | 'header' | 'path' | 'cookie')"
          />
          <div class="mt-3">
            <p
              v-if="param.description"
              class="whitespace-pre-line text-gray-600 dark:text-gray-400 text-sm"
              v-html="param.description"
            />
            <div
              v-if="(param.schema as SchemaObject)?.enum && (param.schema as SchemaObject)?.enum?.length"
              class="flex flex-wrap gap-1.5 mt-2 text-xs"
            >
              <span class="text-gray-500">Enum:</span>
              <span
                v-for="(val, i) in (param.schema as SchemaObject)?.enum"
                :key="i"
                class="px-1.5 py-0.5 rounded bg-gray-100/50 dark:bg-white/5 text-gray-700 dark:text-gray-200"
              >
                {{ typeof val === 'string' ? `"${val}"` : val }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
