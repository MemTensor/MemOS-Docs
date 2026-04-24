<script setup lang="ts">
import type { NuxtError } from '#app'

const localePath = useLocalePath()
const props = defineProps<{
  error: NuxtError
}>()

if (props.error?.statusCode === 404) {
  navigateTo(localePath('/'))
}

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false
})

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <AppHeader />

    <template v-if="error?.statusCode !== 404">
      <UError :error="error" />
    </template>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
