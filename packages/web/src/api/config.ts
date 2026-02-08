import request from './request'

export interface AppConfig {
  sseApiBaseUrl: string
  llmProvider: string
  openaiModel: string
  anthropicModel: string
  hasOpenaiKey: boolean
  hasAnthropicKey: boolean
  hasSseToken: boolean
}

export function getConfig() {
  return request.get<any, { code: number; data: AppConfig }>('/eval/api/v1/config')
}

export function updateConfig(config: Record<string, string>) {
  return request.put<any, { code: number }>('/eval/api/v1/config', config)
}
