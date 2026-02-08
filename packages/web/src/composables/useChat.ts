import { ref } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useSSE } from './useSSE'
import { v4 as uuidv4 } from 'uuid'

export function useChat() {
  const chatStore = useChatStore()
  const { sendMessage: sendSSE, abort } = useSSE()
  const conversationId = ref(uuidv4())
  const autoSending = ref(false)
  const autoSendQueue = ref<string[]>([])

  async function send(content: string) {
    if (!content.trim() || chatStore.isStreaming) return
    if (!chatStore.currentSessionId) return

    // 保存用户消息
    await chatStore.saveMessage('user', content, { messageType: 1 })

    // 调用 SSE
    await sendSSE(content, conversationId.value)
  }

  async function startAutoSend(messageList: string[]) {
    autoSending.value = true
    autoSendQueue.value = [...messageList]

    for (const msg of messageList) {
      if (!autoSending.value) break
      await send(msg)
      // 等待 AI 回复完成
      await waitForStreamEnd()
    }

    autoSending.value = false
    autoSendQueue.value = []
  }

  function stopAutoSend() {
    autoSending.value = false
    autoSendQueue.value = []
    abort()
  }

  function waitForStreamEnd(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!chatStore.isStreaming) {
          resolve()
        } else {
          setTimeout(check, 200)
        }
      }
      check()
    })
  }

  function resetConversation() {
    conversationId.value = uuidv4()
  }

  return {
    send,
    abort,
    startAutoSend,
    stopAutoSend,
    autoSending,
    autoSendQueue,
    resetConversation,
  }
}
