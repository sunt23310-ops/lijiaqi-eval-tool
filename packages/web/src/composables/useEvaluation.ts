import { useChatStore } from '@/stores/chatStore'
import { useEvaluationStore } from '@/stores/evaluationStore'

export function useEvaluation() {
  const chatStore = useChatStore()
  const evalStore = useEvaluationStore()

  async function evaluate() {
    if (!chatStore.currentSessionId) return
    if (chatStore.messages.length < 2) {
      throw new Error('至少需要一轮完整对话才能评测')
    }
    await evalStore.runEvaluation(chatStore.currentSessionId)
  }

  async function loadEvaluations() {
    if (!chatStore.currentSessionId) return
    await evalStore.fetchEvaluations(chatStore.currentSessionId)
  }

  return {
    evaluate,
    loadEvaluations,
  }
}
