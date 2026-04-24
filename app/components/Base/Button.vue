<script setup lang="ts">
const props = withDefaults(defineProps<{
  to?: string
  target?: string
  type?: 'primary' | 'default' | 'success' | 'ghost' | undefined
  leadingIcon?: string
  trailingIcon?: string
}>(), {
  type: 'default'
})

const bgClasses = computed(() => {
  if (props.type === 'primary') {
    return 'text-white inset-shadow-default bg-linear-270 from-0% from-[#408DFC] via-[#4044ED] via-51% to-100% to-[#AA75EF] dark:from-[#5A9CFC] dark:via-[#5D60F3] dark:to-[#9F80F5]'
  }
  if (props.type === 'success') {
    return 'text-white inset-shadow-default bg-linear-270 from-15% from-[#219C5F] to-118% to-[#29EB8B]'
  }
  if (props.type === 'ghost') {
    return 'border border-slate-300 dark:border-primary'
  }
  return 'inset-shadow-default bg-slate-200 dark:bg-[#232E60] text-slate-900 dark:text-white bg-linear-249 dark:-from-5% dark:from-black/42 dark:to-100% dark:to-white dark:bg-blend-soft-light'
})

function handleClick() {
  if (!props.to) {
    return
  }

  if (props.to.startsWith('http')) {
    return props.target === '_blank' ? window.open(props.to, props.target) : navigateTo(props.to, { external: true })
  }

  navigateTo(props.to)
}
</script>

<template>
  <button
    :class="`flex items-center justify-center gap-1.5 h-9.5 px-5 text-base font-medium rounded-[48px] cursor-pointer ${bgClasses} sm:h-11 sm:px-7`"
    @click="handleClick"
  >
    <UIcon
      v-if="leadingIcon"
      class="size-5"
      :name="leadingIcon"
    />
    <template v-if="type === 'ghost'">
      <span class="bg-linear-270 from-15% from-linear-primary to-118% to-primary-light bg-clip-text text-transparent">
        <slot />
      </span>
    </template>
    <slot v-else />
    <UIcon
      v-if="trailingIcon"
      :class="type === 'ghost' ? 'size-5 bg-linear-270 from-15% from-linear-primary to-118% to-primary-light' : 'size-5'"
      :name="trailingIcon"
    />
  </button>
</template>
