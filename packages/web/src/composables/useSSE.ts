import { ref } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'

/**
 * SSE 连接 composable
 *
 * 通过后端代理 (/eval/api/v1/sse/proxy) 转发到目标 SSE API
 * 使用 fetch + ReadableStream 实现流式接收
 */
export function useSSE() {
  const abortController = ref<AbortController | null>(null)
  const ttft = ref<number | null>(null)
  const latency = ref<number | null>(null)

  function sendMessage(content: string, conversationId: string): Promise<void> {
    const chatStore = useChatStore()
    const authStore = useAuthStore()
    const startTime = Date.now()
    let firstChunk = true

    chatStore.startStreaming()

    return new Promise(async (resolve, reject) => {
      const controller = new AbortController()
      abortController.value = controller

      try {
        const response = await fetch('/eval/api/v1/sse/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token: authStore.token,
          },
          body: JSON.stringify({ conversationId, messageType: 1, content }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          chatStore.stopStreaming()
          reject(new Error(`SSE 请求失败: HTTP ${response.status}`))
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const parts = buffer.split('\n\n')
          buffer = parts.pop() || ''

          for (const part of parts) {
            for (const line of part.split('\n')) {
              if (!line.startsWith('data:')) continue
              const data = line.slice(5)

              if (data === '[Done]') {
                latency.value = Date.now() - startTime
                const fullContent = chatStore.streamingContent
                chatStore.stopStreaming()
                await chatStore.saveMessage('assistant', fullContent, {
                  latencyMs: latency.value,
                  ttftMs: ttft.value ?? undefined,
                })
                resolve()
                return
              }
              if (data === '[Done]Err') {
                chatStore.stopStreaming()
                reject(new Error('SSE 返回错误'))
                return
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  if (firstChunk) {
                    ttft.value = Date.now() - startTime
                    firstChunk = false
                  }
                  chatStore.appendStreamChunk(parsed.content)
                }
              } catch {
                if (data.trim()) {
                  if (firstChunk) {
                    ttft.value = Date.now() - startTime
                    firstChunk = false
                  }
                  chatStore.appendStreamChunk(data)
                }
              }
            }
          }
        }

        // 流正常结束但没有 [Done] 标记
        const fullContent = chatStore.streamingContent
        if (fullContent) {
          latency.value = Date.now() - startTime
          chatStore.stopStreaming()
          await chatStore.saveMessage('assistant', fullContent, {
            latencyMs: latency.value,
            ttftMs: ttft.value ?? undefined,
          })
        } else {
          chatStore.stopStreaming()
        }
        resolve()
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          chatStore.stopStreaming()
          reject(err)
        } else {
          resolve()
        }
      }
    })
  }

  function abort() {
    abortController.value?.abort()
    const chatStore = useChatStore()
    chatStore.stopStreaming()
  }

  return { sendMessage, abort, ttft, latency }
}
