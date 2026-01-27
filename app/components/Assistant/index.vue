<script setup lang="ts">
const {
  isOpen,
  messages,
  status,
  userInput,
  suggestions,
  toggleOpen,
  sendMessage,
  stopStreaming
} = useAssistant()
const { trackEvent } = useArms()

const onEnter = (e: KeyboardEvent) => {
  if (e.isComposing) {
    e.stopImmediatePropagation()
    return
  }
}

const handleFormSubmit = async () => {
  trackEvent('发起对话', '按钮点击')
  try {
    await sendMessage(userInput.value)
  } catch (error) {
    console.error('Failed to submit message:', error)
  }
}

const suggestionsRef = ref<HTMLElement | null>(null)

watch([suggestions, status], async () => {
  if (status.value === 'ready' && suggestions.value?.length > 0) {
    await nextTick()
    suggestionsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
})

function onClose() {
  trackEvent('关闭助手面板', '按钮点击')
  toggleOpen()
}

function onSuggestionClick(item: string) {
  trackEvent('参考问题', '按钮点击')
  sendMessage(item)
}

function onStopStreaming() {
  trackEvent('停止对话', '按钮点击')
  stopStreaming()
}
</script>

<template>
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="h-full shrink-0 overflow-hidden"
    >
      <UDashboardSidebar
        id="assistant"
        class="overflow-y-auto h-full border-l border-default -ml-px"
        side="right"
        resizable
        :default-size="400"
        :min-size="400"
        :max-size="576"
        :ui="{
          body: 'pb-4'
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide:stars"
              class="text-primary"
            />
            <span class="font-medium">{{ $t('assistant.title') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="group flex items-center hover:bg-gray-100 dark:hover:bg-white/10 p-1.5 rounded-lg cursor-pointer"
              @click="onClose"
            >
              <UIcon
                name="i-lucide:x"
                class="size-4"
              />
            </button>
          </div>
        </div>

        <UChatPalette
          :ui="{
            content: 'scrollbar-hide pr-px'
          }"
        >
          <UChatMessage
            id="welcome"
            role="assistant"
            :content="$t('assistant.welcome')"
            :ui="{
              root: 'text-sm'
            }"
          />
          <UChatMessages
            compact
            :messages="messages"
            :status="status"
            should-auto-scroll
            :ui="{
              root: 'px-0 [&>article]:last-of-type:min-h-auto'
            }"
          >
            <template #content="{ message }">
              <AssistantMDC
                v-if="message.role === 'assistant' && message.content"
                :value="message.content"
                class="text-sm"
              />
              <p
                v-else-if="message.role === 'user'"
                class="text-sm whitespace-pre-wrap"
              >
                {{ message.content }}
              </p>
            </template>
          </UChatMessages>
          <div
            v-show="status === 'ready' && suggestions.length"
            ref="suggestionsRef"
            class="space-y-3 mb-4"
          >
            <div class="text-sm text-gray-300">
              {{ $t('assistant.suggestions') }}
            </div>
            <ul class="text-sm text-primary space-y-2">
              <li
                v-for="(item, index) in suggestions"
                :key="index"
                class="hover:text-primary/80 cursor-pointer"
                @click="onSuggestionClick(item)"
              >
                {{ item }}
              </li>
            </ul>
          </div>
          <template #prompt>
            <UChatPrompt
              v-model="userInput"
              class="border border-white/10 px-2 rounded-t-lg"
              variant="soft"
              :placeholder="$t('assistant.inputPlaceholder')"
              :ui="{
                body: 'items-end'
              }"
              @keydown.enter.exact="onEnter"
              @submit="handleFormSubmit"
            >
              <UChatPromptSubmit
                size="sm"
                submitted-icon="i-lucide-circle"
                streaming-icon="i-lucide-circle"
                :status="status"
                @stop="onStopStreaming"
              />
            </UChatPrompt>
          </template>
        </UChatPalette>
      </UDashboardSidebar>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: max-width 0.3s ease;
  max-width: 576px;
}

.slide-enter-from,
.slide-leave-to {
  max-width: 0;
}
</style>
