<script setup lang="ts">
const route = useRoute()
const nuxtApp = useNuxtApp()

// Handle scroll reset on page navigation finish
nuxtApp.hook('page:finish', () => {
  nextTick(() => {
    // Check if there is a hash
    if (route.hash) {
      const el = document.querySelector(route.hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Reset scroll to top if no hash
      const el = document.getElementById('dashboard-panel-main')
      if (el) {
        el.scrollTop = 0
      }
    }
  })
})

watch(() => route.hash, (hash) => {
  if (hash) {
    nextTick(() => {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }
})

onMounted(() => {
  if (route.hash) {
    nextTick(() => {
      const el = document.querySelector(route.hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }
})
</script>

<template>
  <UDashboardGroup
    :persistent="false"
    unit="px"
    class="h-screen overflow-hidden"
  >
    <UDashboardPanel
      id="main"
      class="h-full overflow-y-auto scrollbar-hide "
    >
      <slot />
    </UDashboardPanel>
    <Assistant />
  </UDashboardGroup>
</template>
