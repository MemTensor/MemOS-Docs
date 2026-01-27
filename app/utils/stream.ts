export class Stream<T> {
  private readable: ReadableStream<T>
  private controller: AbortController

  constructor(readable: ReadableStream<T>, controller: AbortController) {
    this.readable = readable
    this.controller = controller
  }

  /**
   * Create a Stream from a raw SSE response body
   */
  static fromSSEResponse<T>(
    responseStream: ReadableStream<Uint8Array>,
    controller: AbortController
  ): Stream<T> {
    let buffer = ''
    const decoder = new TextDecoder()

    const transformStream = new TransformStream<Uint8Array, T>({
      transform(chunk, controller) {
        // 1. Concatenate newly received data
        buffer += decoder.decode(chunk, { stream: true })

        // 2. Try splitting by SSE separator
        const parts = buffer.split('\n\n')
        // 3. Put the remaining small chunk (possibly incomplete) back into buffer for next processing
        buffer = parts.pop() || ''

        for (const part of parts) {
          const lines = part.split('\n').map(l => l.trim()).filter(l => l)
          let isError = false
          let data = ''

          for (const line of lines) {
            if (line.startsWith('event: error')) {
              isError = true
            } else if (line.startsWith('data: ')) {
              data = line.slice(6)
            }
          }

          if (data) {
            // Encountered end marker, close stream
            if (data === '[DONE]') {
              controller.terminate()
              return
            }

            try {
              // Parse string to JSON object
              const parsed = JSON.parse(data)
              if (isError) {
                controller.error(new Error(parsed.error || 'Stream error'))
              } else {
                // Enqueue object into stream for downstream consumption
                controller.enqueue(parsed)
              }
            } catch (e) {
              console.error('[Stream] Parse error:', e)
              // Optionally we could error the stream here, but robust handling might just skip bad frames
            }
          }
        }
      }
    })

    const transformed = responseStream.pipeThrough(transformStream)
    return new Stream(transformed, controller)
  }

  /**
   * Async iterator to read the stream
   */
  async* [Symbol.asyncIterator](): AsyncIterator<T> {
    const reader = this.readable.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          yield value
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Abort the stream
   */
  abort() {
    this.controller.abort()
  }

  /**
   * Get the underlying ReadableStream
   */
  getReadableStream(): ReadableStream<T> {
    return this.readable
  }
}
