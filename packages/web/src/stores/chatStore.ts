import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session } from '@/types/session'
import type { Message } from '@/types/message'
import * as sessionsApi from '@/api/sessions'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Session[]>([])
  const currentSessionId = ref<number | null>(null)
  const messages = ref<Message[]>([])
  const isStreaming = ref(false)
  const streamingContent = ref('')
  const loading = ref(false)

  const currentSession = computed(() =>
    sessions.value.find((s) => s.id === currentSessionId.value) ?? null
  )

  async function fetchSessions() {
    const res = await sessionsApi.listSessions()
    sessions.value = (res as any).data ?? res
  }

  async function createSession(name: string) {
    const res = await sessionsApi.createSession(name)
    const session = (res as any).data ?? res
    sessions.value.unshift(session)
    currentSessionId.value = session.id
    messages.value = []
    return session
  }

  async function selectSession(id: number) {
    currentSessionId.value = id
    loading.value = true
    try {
      const res = await sessionsApi.listMessages(id)
      messages.value = (res as any).data ?? res
    } finally {
      loading.value = false
    }
  }

  async function removeSession(id: number) {
    await sessionsApi.deleteSession(id)
    sessions.value = sessions.value.filter((s) => s.id !== id)
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0]?.id ?? null
      if (currentSessionId.value) {
        await selectSession(currentSessionId.value)
      } else {
        messages.value = []
      }
    }
  }

  async function saveMessage(
    role: 'user' | 'assistant',
    content: string,
    extra?: { messageType?: number; latencyMs?: number; ttftMs?: number; rawResponse?: Record<string, any> }
  ) {
    if (!currentSessionId.value) return
    const res = await sessionsApi.addMessage(currentSessionId.value, {
      role,
      content,
      ...extra,
    })
    const msg = (res as any).data ?? res
    messages.value.push(msg)
    return msg
  }

  function appendStreamChunk(chunk: string) {
    streamingContent.value += chunk
  }

  function startStreaming() {
    isStreaming.value = true
    streamingContent.value = ''
  }

  function stopStreaming() {
    isStreaming.value = false
    streamingContent.value = ''
  }

  return {
    sessions,
    currentSessionId,
    currentSession,
    messages,
    isStreaming,
    streamingContent,
    loading,
    fetchSessions,
    createSession,
    selectSession,
    removeSession,
    saveMessage,
    appendStreamChunk,
    startStreaming,
    stopStreaming,
  }
})
