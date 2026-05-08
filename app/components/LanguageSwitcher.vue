<script setup lang="ts">
const { locale, setLocale } = useI18n()

// 获取要切换到的语言代码
const targetLocale = computed(() => {
  return locale.value === 'cn' ? 'en' : 'cn'
})

// 切换语言
function switchLanguage() {
  window.setLocaleCookie(targetLocale.value)
  setLocale(targetLocale.value as 'cn' | 'en')
}
</script>

<template>
  <button
    type="button"
    class="group inline-flex items-center justify-center h-8 w-8 shrink-0 cursor-pointer border border-slate-300 dark:border-slate-600 rounded-md hover:border-slate-400 dark:hover:border-slate-100"
    :aria-label="$t('header.switchLanguage')"
    @click="switchLanguage"
  >
    <LocaleSwitch class="size-4 text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100" />
  </button>
</template>
