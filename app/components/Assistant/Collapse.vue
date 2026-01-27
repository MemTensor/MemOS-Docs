<script setup lang="ts">
const { toggleOpen } = useAssistant()
const { trackEvent } = useArms()

function onToggleOpen() {
  trackEvent('点击Ask AI', '按钮点击')
  toggleOpen()
}
</script>

<template>
  <UButton
    icon="i-lucide:stars"
    color="neutral"
    variant="outline"
    :ui="{
      base: 'rounded-lg cursor-pointer',
      leadingIcon: 'size-4'
    }"
    @click="onToggleOpen"
  >
    Ask AI
  </UButton>
</template>
