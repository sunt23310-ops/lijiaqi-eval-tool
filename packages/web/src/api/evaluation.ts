import request from './request'
import type { Evaluation, EvaluationSummary } from '@/types/evaluation'

export function triggerEvaluation(sessionId: number) {
  return request.post<any, { code: number; data: Evaluation }>(
    `/eval/api/v1/sessions/${sessionId}/evaluate`
  )
}

export function listEvaluations(sessionId: number) {
  return request.get<any, { code: number; data: EvaluationSummary[] }>(
    `/eval/api/v1/sessions/${sessionId}/evaluations`
  )
}

export function getEvaluation(evalId: number) {
  return request.get<any, { code: number; data: Evaluation }>(
    `/eval/api/v1/evaluations/${evalId}`
  )
}
