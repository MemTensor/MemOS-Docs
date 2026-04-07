<script setup lang="ts">
const props = defineProps<{
  prop: string
  schema: SchemaObject
  required: string[] | undefined
  parentProp: string | undefined
}>()

const properties = computed(() => {
  if (!props.schema) return null
  if (props.schema?.properties) return props.schema.properties
  if (props.schema.anyOf) {
    return props.schema.anyOf.filter(item => Object.prototype.hasOwnProperty.call(item, 'properties'))?.[0]?.properties
  }
  if (props.schema.oneOf) {
    return props.schema.oneOf.filter(item => Object.prototype.hasOwnProperty.call(item, 'properties'))?.[0]?.properties
  }
  return null
})

function isRequired(list: string[] | undefined | null, prop: string) {
  if (!list) return false
  return list.includes(prop)
}

const arrayItemEnum = computed(() => {
  const s = props.schema
  if (s?.type !== 'array' || !s.items || Array.isArray(s.items))
    return [] as unknown[]
  const it = s.items as SchemaObject
  return Array.isArray(it.enum) && it.enum.length ? it.enum : []
})
</script>

<template>
  <div
    v-if="schema"
    class="border-gray-100 dark:border-gray-800 border-b last:border-b-0"
  >
    <div class="py-6">
      <ApiParameterLine
        :name="prop"
        :parent-name="parentProp"
        :default-value="schema.default"
        :schema="schema"
        :required="isRequired(required, prop)"
      />
      <div class="mt-4">
        <div
          v-if="schema.description"
          class="text-gray-400 text-sm [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mt-0 [&_ul]:mb-0 [&_ul]:space-y-2 [&_ul]:pl-4 [&_ul]:list-disc [&_ul]:text-gray-400 [&_li]:leading-relaxed [&_code]:rounded [&_code]:bg-gray-100/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-gray-700 dark:[&_code]:bg-white/5 dark:[&_code]:text-gray-200 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline"
          v-html="schema.description"
        />
        <div
          v-if="schema.enum && schema.enum.length && !arrayItemEnum.length"
          class="flex flex-wrap gap-1.5 mt-2 text-xs"
        >
          <span class="text-gray-500">Enum:</span>
          <span
            v-for="(val, i) in schema.enum"
            :key="i"
            class="px-1.5 py-0.5 rounded bg-gray-100/50 dark:bg-white/5 text-gray-700 dark:text-gray-200"
          >
            {{ typeof val === 'string' ? `"${val}"` : val }}
          </span>
        </div>
        <div
          v-else-if="arrayItemEnum.length"
          class="flex flex-wrap gap-1.5 text-xs"
          :class="schema.description ? 'mt-4' : 'mt-2'"
        >
          <span class="text-gray-500">Enum:</span>
          <span
            v-for="(val, i) in arrayItemEnum"
            :key="i"
            class="px-1.5 py-0.5 rounded bg-gray-100/50 dark:bg-white/5 text-gray-700 dark:text-gray-200"
          >
            {{ typeof val === 'string' ? `"${val}"` : val }}
          </span>
        </div>
        <!-- Handle anyOf -->
        <ApiRequestBodyArrayParam
          v-if="schema.anyOf?.length"
          :any-of="schema.anyOf"
        />
        <!-- Handle oneOf -->
        <ApiRequestBodyArrayParam
          v-if="schema.oneOf?.length"
          :any-of="schema.oneOf"
        />
        <!-- Handle Items -->
        <ApiRequestBodyArrayParam
          v-if="schema.items"
          :items="schema.items"
        />
        <ApiParameterExample :value="schema.example" />
      </div>
      <template v-if="properties">
        <ApiCollapse class="mt-4">
          <ApiRequestBodyList
            :properties="properties"
            :required="schema.required"
            :parent-prop="prop"
          />
        </ApiCollapse>
      </template>
    </div>
  </div>
</template>
