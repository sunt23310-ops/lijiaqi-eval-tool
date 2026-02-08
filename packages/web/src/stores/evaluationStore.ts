import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Evaluation, EvaluationSummary } from '@/types/evaluation'
import * as evalApi from '@/api/evaluation'

export const useEvaluationStore = defineStore('evaluation', () => {
  const evaluations = ref<EvaluationSummary[]>([])
  const currentEvaluation = ref<Evaluation | null>(null)
  const isEvaluating = ref(false)
  const viewMode = ref<'history' | 'detail'>('history')

  async function fetchEvaluations(sessionId: number) {
    const res = await evalApi.listEvaluations(sessionId)
    evaluations.value = (res as any).data ?? res
    if (evaluations.value.length === 1) {
      await loadDetail(evaluations.value[0].id)
    } else {
      viewMode.value = 'history'
      currentEvaluation.value = null
    }
  }

  async function runEvaluation(sessionId: number) {
    isEvaluating.value = true
    try {
      const res = await evalApi.triggerEvaluation(sessionId)
      const evaluation = (res as any).data ?? res
      currentEvaluation.value = evaluation
      viewMode.value = 'detail'
      await fetchEvaluations(sessionId)
    } finally {
      isEvaluating.value = false
    }
  }

  async function loadDetail(evalId: number) {
    const res = await evalApi.getEvaluation(evalId)
    currentEvaluation.value = (res as any).data ?? res
    viewMode.value = 'detail'
  }

  function backToHistory() {
    viewMode.value = 'history'
    currentEvaluation.value = null
  }

  function reset() {
    evaluations.value = []
    currentEvaluation.value = null
    viewMode.value = 'history'
    isEvaluating.value = false
  }

  return {
    evaluations,
    currentEvaluation,
    isEvaluating,
    viewMode,
    fetchEvaluations,
    runEvaluation,
    loadDetail,
    backToHistory,
    reset,
  }
})
