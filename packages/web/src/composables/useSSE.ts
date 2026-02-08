import { ref } from 'vue'
import { connectSSE } from '@/api/sseClient'
import { useChatStore } from '@/stores/chatStore'
import { getConfig } from '@/api/config'

export function useSSE() {
  const abortController = ref<AbortController | null>(null)
  const ttft = ref<number | null>(null)
  const latency = ref<number | null>(null)

  async function sendMessage(content: string, conversationId: string) {
    const chatStore = useChatStore()
    const startTime = Date.now()
    let firstChunk = true

    chatStore.startStreaming()

    // 获取 SSE API 配置
    let sseUrl = ''
    let sseToken = ''
    try {
      const configRes = await getConfig()
      const config = (configRes as any).data ?? configRes
      sseUrl = config.sseApiUrl || ''
      sseToken = config.sseToken || ''
    } catch {
      // 使用默认配置
    }

    if (!sseUrl) {
      chatStore.stopStreaming()
      throw new Error('未配置 SSE API 地址，请在设置中配置')
    }

    abortController.value = connectSSE({
      url: sseUrl,
      token: sseToken,
      conversationId,
      content,
      onMessage(text) {
        if (firstChunk) {
          ttft.value = Date.now() - startTime
          firstChunk = false
        }
        chatStore.appendStreamChunk(text)
      },
      async onDone() {
        latency.value = Date.now() - startTime
        const fullContent = chatStore.streamingContent
        chatStore.stopStreaming()
        await chatStore.saveMessage('assistant', fullContent, {
          latencyMs: latency.value,
          ttftMs: ttft.value ?? undefined,
        })
      },
      onError(error) {
        chatStore.stopStreaming()
        console.error('SSE error:', error)
      },
    })
  }

  function abort() {
    abortController.value?.abort()
    const chatStore = useChatStore()
    chatStore.stopStreaming()
  }

  return { sendMessage, abort, ttft, latency }
}
