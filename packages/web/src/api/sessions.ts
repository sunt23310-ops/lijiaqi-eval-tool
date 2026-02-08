import request from './request'
import type { Session } from '@/types/session'
import type { Message } from '@/types/message'

export function createSession(name: string) {
  return request.post<any, { code: number; data: Session }>('/eval/api/v1/sessions', { name })
}

export function listSessions() {
  return request.get<any, { code: number; data: Session[] }>('/eval/api/v1/sessions')
}

export function getSession(id: number) {
  return request.get<any, { code: number; data: Session }>(`/eval/api/v1/sessions/${id}`)
}

export function deleteSession(id: number) {
  return request.delete<any, { code: number }>(`/eval/api/v1/sessions/${id}`)
}

export function addMessage(sessionId: number, body: {
  role: string
  content: string
  messageType?: number
  latencyMs?: number
  ttftMs?: number
  rawResponse?: Record<string, any>
}) {
  return request.post<any, { code: number; data: Message }>(
    `/eval/api/v1/sessions/${sessionId}/messages`,
    body
  )
}

export function listMessages(sessionId: number) {
  return request.get<any, { code: number; data: Message[] }>(
    `/eval/api/v1/sessions/${sessionId}/messages`
  )
}
