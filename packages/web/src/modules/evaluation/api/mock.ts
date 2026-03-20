import request from '@/api/request'

export interface PresetScenario {
  key: string
  name: string
  emoji: string
  description: string
  rounds: number
  messages: string[]
}

export function getPresets() {
  return request.get<any, { code: number; data: PresetScenario[] }>('/eval/api/v1/mock/presets')
}

export function generateMockQuestions(messages: Array<{ role: string; content: string }>) {
  return request.post<any, { code: number; data: string[] }>('/eval/api/v1/mock/generate', {
    messages,
  }, { timeout: 60_000 }) // LLM调用需要更长时间
}
