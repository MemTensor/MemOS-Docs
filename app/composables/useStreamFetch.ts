import { defu } from 'defu'
import { Stream } from '~/utils/stream'

export interface StreamFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  baseURL?: string
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string>
  query?: Record<string, string>
  timeout?: number
  signal?: AbortSignal
}

export function useStreamFetch() {
  const config = useRuntimeConfig()

  /**
   * Request a stream with dynamic timeout and robust error handling
   */
  async function reqStream<T>(
    url: string,
    options: StreamFetchOptions = {}
  ): Promise<Stream<T>> {
    const { timeout = 30000, signal, baseURL, ...fetchOptions } = options
    const controller = new AbortController()

    // Support external abort signal
    if (signal) {
      if (signal.aborted) {
        controller.abort()
      } else {
        signal.addEventListener('abort', () => {
          controller.abort()
        })
      }
    }

    let timeoutId: NodeJS.Timeout | null = null
    let transformController: TransformStreamDefaultController<Uint8Array> | null = null

    // Timeout control
    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          const error = new Error(`Stream timeout after ${timeout}ms inactivity`)
          error.name = 'TimeoutError'

          // Error the stream so the reader throws
          if (transformController) {
            transformController.error(error)
          }
          // Abort the fetch request
          controller.abort()
        }, timeout)
      }
    }

    const clearTimeoutTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
    }

    // Use TransformStream to monitor data flow
    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      start(controller) {
        transformController = controller
        resetTimeout()
      },
      transform(chunk, controller) {
        // Reset timeout on every received chunk
        resetTimeout()
        controller.enqueue(chunk)
      },
      flush() {
        // Transmission finished, clear timer
        clearTimeoutTimer()
      }
    })

    try {
      const response = await $fetch(url, {
        ...fetchOptions,
        baseURL: baseURL ?? config.public?.apiBase,
        responseType: 'stream',
        signal: controller.signal,
        // native fetch supports duplex
        duplex: fetchOptions.method === 'POST' ? 'half' : undefined,
        // Combine default headers
        headers: defu(fetchOptions.headers, {
          Accept: 'text/event-stream'
        })
      }) as ReadableStream<Uint8Array>

      // If response is not a stream (e.g. mocked or error), throw
      if (!response || !response.pipeThrough) {
        throw new Error('Invalid stream response')
      }
      // 1. Pipe original stream into monitoring pipeline
      const monitoredStream = response.pipeThrough(transformStream)
      // 2. Convert binary stream to usable object stream (Stream<T>)
      return Stream.fromSSEResponse<T>(monitoredStream, controller)
    } catch (error: unknown) {
      console.log('error: ', error)
      clearTimeoutTimer()

      const err = error as Error
      // Enhance error with context
      if (err.name !== 'TimeoutError' && err.name !== 'AbortError') {
        console.error('[StreamFetch] Request failed:', url, err)
      }

      throw error
    }
  }

  return {
    reqStream
  }
}
