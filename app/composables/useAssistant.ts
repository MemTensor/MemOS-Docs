export interface Message {
  id: string // Unique ID required by UChatMessages
  role: 'user' | 'assistant'
  content: string
  createAt?: Date
}

export type AssistantStatus = 'submitted' | 'streaming' | 'ready' | 'error'

const isOpen = ref(false)
const isMaximized = ref(false)
const messages = ref<Message[]>([])
const status = ref<AssistantStatus>('ready')
const error = ref<string | null>(null)
const userInput = ref('')
const suggestions = ref<string[]>([])

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const sessionId = generateSessionId()

export const useAssistant = () => {
  const { t } = useI18n()

  const isStreaming = computed(() => status.value === 'streaming')
  const isReady = computed(() => status.value === 'ready')
  const hasError = computed(() => !!error.value)

  let currentController: AbortController | null = null
  const { reqStream } = useStreamFetch()

  function toggleOpen() {
    isOpen.value = !isOpen.value
  }

  function toggleMaximize() {
    isMaximized.value = !isMaximized.value
  }

  function setUserInput(value: string) {
    userInput.value = value
  }

  function setSuggestions(value: string[]) {
    suggestions.value = value
  }

  function addMessage(message: Message) {
    messages.value.push(message)
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
    status.value = errorMessage ? 'error' : 'ready'
  }
  function stopStreaming() {
    if (currentController) {
      currentController.abort()
      currentController = null
      status.value = 'ready'
    }
  }

  function initialize() {
    status.value = 'ready'
    error.value = null

    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage?.role === 'assistant' && !lastMessage.content.trim()) {
        messages.value.pop()
      }
    }

    if (currentController) {
      currentController.abort()
      currentController = null
    }
  }

  function updateLastMessage(content: string) {
    const lastIndex = messages.value.length - 1
    const lastMessage = messages.value[lastIndex]
    if (lastMessage) {
      messages.value = [
        ...messages.value.slice(0, lastIndex),
        {
          id: lastMessage.id,
          role: lastMessage.role,
          content: content,
          createAt: lastMessage.createAt
        }
      ]
    }
  }

  async function sendMessage(input: string) {
    const query = input.trim()
    if (!query) return

    initialize()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      createAt: new Date()
    }
    addMessage(userMessage)

    if (userInput.value) {
      setUserInput('')
    }

    status.value = 'submitted'

    try {
      currentController = new AbortController()
      const stream = await reqStream<{ type: string, data: string | string[], error?: string }>('/memos-ai/kb_stream_chat', {
        method: 'POST',
        body: {
          user_id: sessionId,
          query
        },
        signal: currentController.signal
      })

      let assistantContent = ''

      for await (const chunk of stream) {
        if (status.value !== 'streaming') {
          status.value = 'streaming'
          const assistantId = (Date.now() + 1).toString()
          addMessage({
            id: assistantId,
            role: 'assistant',
            content: '',
            createAt: new Date()
          })
        }
        if (chunk.type === 'text' && chunk.data) {
          assistantContent += chunk.data
          updateLastMessage(assistantContent)
        } else if (chunk.type === 'suggestions' && Array.isArray(chunk.data)) {
          setSuggestions(chunk.data as string[])
        } else if (chunk.error) {
          throw new Error(chunk.error)
        }
      }

      status.value = 'ready'
    } catch (error) {
      status.value = 'ready'
      addMessage({
        id: (+Date.now()).toString(),
        role: 'assistant',
        content: t('assistant.systemError'),
        createAt: new Date()
      })
      console.error('Failed to get assistant response:', error)
    } finally {
      currentController = null
    }
  }

  return {
    isOpen,
    isMaximized,
    userInput,
    messages,
    status,
    error,
    suggestions,
    isStreaming,
    isReady,
    hasError,
    toggleOpen,
    toggleMaximize,
    setUserInput,
    sendMessage,
    stopStreaming,
    setError
  }
}
