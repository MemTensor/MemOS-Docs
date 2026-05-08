<script lang="ts">
interface colorsProps {
  [key: string]: {
    method: string
    param: string
  }
}
</script>

<script setup lang="ts">
const props = defineProps<{
  path: string
  method: string
}>()

const { server } = useOpenApi(inject('collectionName'))

const colorsMap: colorsProps = {
  get: {
    method: 'bg-green-400/20 dark:bg-green-400/20 text-green-700 dark:text-green-400',
    param: 'text-[#2AB673] bg-[#2AB673]/10 border-[#2AB673]/30'
  },
  post: {
    method: 'bg-blue-400/20 dark:bg-blue-400/20 text-blue-700 dark:text-blue-400',
    param: 'text-[#3064E3] bg-[#3064E3]/10 border-[#3064E3]/30'
  },
  delete: {
    method: 'bg-red-400/20 dark:bg-red-400/20 text-red-700 dark:text-red-400',
    param: 'text-[#CB3A32] bg-[#CB3A32]/10 border-[#CB3A32]/30'
  },
  put: {
    method: 'bg-yellow-400/20 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-400',
    param: 'text-[#C28C30] bg-[#C28C30]/10 border-[#C28C30]/30'
  }
}

let timer: ReturnType<typeof setTimeout> | number
const isCopy = ref<boolean>(false)

const pathArr = computed(() => {
  return props.path.split('/').filter(Boolean)
})

onUnmounted(() => {
  clearTimeout(timer)
})

// Determine whether segment is a parameter
function isParameter(path: string) {
  return /^\{[^}]*\}$/.test(path)
}

// Copy full path
function handleCopy() {
  const baseUrl = server.value ?? ''

  copyText(baseUrl + props.path)
  isCopy.value = true
  timer = setTimeout(() => {
    isCopy.value = false
  }, 2000)
}
</script>

<template>
  <div
    class="group flex w-full items-center justify-between bg-background-light border border-default rounded-2xl mt-6 p-1 cursor-pointer"
    @click="handleCopy"
  >
    <div class="relative flex gap-2 min-w-0 rounded-xl items-center p-1.5">
      <div
        class="rounded-lg font-bold px-1.5 py-0.5 text-sm leading-5 bg-blue-400/20 dark:bg-blue-400/20"
        :class="colorsMap[method]?.method"
      >
        {{ method.toUpperCase() }}
      </div>
      <div class="flex items-center gap-0.5 overflow-x-auto flex-1 no-scrollbar">
        <template
          v-for="(subpath, index) in pathArr"
          :key="index"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400">
            /
          </div>
          <div
            class="text-sm font-medium min-w-max"
            :class="isParameter(subpath) ? `rounded-md px-1 border-2 ${colorsMap[method]?.param}` : 'text-gray-800 dark:text-white'"
          >
            {{ subpath }}
          </div>
        </template>
      </div>
    </div>
    <div class="flex items-center p-1.5">
      <UIcon
        v-show="!isCopy"
        name="i-lucide-copy"
        class="text-[#ffffff4d] hidden group-hover:block"
      />
      <UIcon
        v-show="isCopy"
        name="i-lucide-circle-check"
        class="text-primary"
      />
    </div>
  </div>
</template>
