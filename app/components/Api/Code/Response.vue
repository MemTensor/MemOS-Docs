<script setup lang="ts">
const props = defineProps<{
  path: string
  method: HttpMethods
}>()

const collectionName = inject<CollectionName>('collectionName')
const {
  getResponseStatusCodes,
  getResponseContentTypes,
  getResponseExampleVariants,
  generateResponseExample
} = useOpenApi(collectionName)

const currentCode = ref<string | number>('200')
const currentContentType = ref<string>('')
const currentExampleKey = ref<string>('')

const statusCodes = computed(() => {
  return getResponseStatusCodes(props.path, props.method)
})

const contentTypes = computed(() => {
  return getResponseContentTypes(props.path, props.method, currentCode.value)
})

const responseOptions = computed(() => {
  const options: { code: string, contentType: string, exampleKey: string, label: string }[] = []

  for (const code of statusCodes.value) {
    const types = getResponseContentTypes(props.path, props.method, code)
    if (types.length > 0) {
      types.forEach((type) => {
        const variants = getResponseExampleVariants(props.path, props.method, code, type)
        if (variants.length > 1) {
          variants.forEach((variant) => {
            options.push({
              code: code.toString(),
              contentType: type,
              exampleKey: variant.key,
              label: variant.label
            })
          })
        } else {
          const variant = variants[0]
          options.push({
            code: code.toString(),
            contentType: type,
            exampleKey: variant?.key ?? '',
            label: types.length > 1 ? `${code}(${type})` : (variant?.label || code.toString())
          })
        }
      })
    } else {
      options.push({
        code: code.toString(),
        contentType: '',
        exampleKey: '',
        label: code.toString()
      })
    }
  }
  return options
})

watch(contentTypes, (newTypes) => {
  if (newTypes.length > 0 && (!currentContentType.value || !newTypes.includes(currentContentType.value))) {
    currentContentType.value = newTypes[0]!
  }
}, { immediate: true })

watch(responseOptions, (options) => {
  if (options.length === 0) return
  const matched = options.find(option =>
    option.code === currentCode.value.toString()
    && option.contentType === currentContentType.value
    && option.exampleKey === currentExampleKey.value
  )
  if (!matched) {
    const first = options[0]!
    currentCode.value = first.code
    currentContentType.value = first.contentType
    currentExampleKey.value = first.exampleKey
  }
}, { immediate: true })

const exampleObjects = computed(() => {
  const example = generateResponseExample(
    props.path,
    props.method,
    currentCode.value,
    currentContentType.value,
    currentExampleKey.value || undefined
  )
  return JSON.stringify(example, null, 2) ?? ''
})

function handleClick(code: string | number, type: string, exampleKey: string) {
  currentCode.value = code
  currentContentType.value = type
  currentExampleKey.value = exampleKey
}

const isCopy = ref<boolean>(false)
let timer: ReturnType<typeof setTimeout>

onUnmounted(() => {
  clearTimeout(timer)
})

async function handleCopy() {
  navigator.clipboard.writeText(exampleObjects.value)
  isCopy.value = true
  timer = setTimeout(() => {
    isCopy.value = false
  }, 2000)
}
</script>

<template>
  <ApiCode>
    <template #header>
      <div class="relative flex-1 min-w-0 text-xs leading-6 gap-1 flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-black/15 hover:scrollbar-thumb-black/20 active:scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20 dark:hover:scrollbar-thumb-white/25 dark:active:scrollbar-thumb-white/25">
        <button
          v-for="option in responseOptions"
          :key="`${option.code}-${option.contentType}-${option.exampleKey}`"
          class="relative inline-flex items-center gap-1.5 text-default hover:bg-elevated/50 px-2 py-1.5 text-sm rounded-md cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus:outline-none transition-colors"
          :class="(currentCode === option.code && currentContentType === option.contentType && currentExampleKey === option.exampleKey) ? 'bg-elevated text-highlighted' : ''"
          @click="handleClick(option.code, option.contentType, option.exampleKey)"
        >
          <span class="truncate">{{ option.label }}</span>
        </button>
      </div>
      <button
        class="cursor-pointer"
        @click="handleCopy"
      >
        <UIcon
          :name=" isCopy ? 'i-lucide-circle-check' : 'i-lucide-copy'"
          :class="isCopy ? 'text-primary' : 'text-gray-400'"
        />
      </button>
    </template>
    <template #panel>
      <ApiCodeBlock
        v-if="exampleObjects"
        :code="exampleObjects"
        language="json"
      />
    </template>
  </ApiCode>
</template>
