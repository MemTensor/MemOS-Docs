<script setup lang="ts">
const colorMode = useColorMode()

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="group inline-flex items-center justify-center h-8 w-8 cursor-pointer border border-slate-300 dark:border-slate-600 rounded-md hover:border-slate-400 dark:hover:border-slate-100 shrink-0"
    :aria-label="$t('header.toggleColorMode')"
    @click="toggle"
  >
    <UIcon
      :name="colorMode.value === 'dark' ? 'ri:sun-line' : 'ri:moon-line'"
      class="size-4 text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100"
    />
  </button>
</template>
