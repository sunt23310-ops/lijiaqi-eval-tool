import request from './request'

export interface AppConfig {
  sseApiUrl: string
  sseToken: string
  llmProvider: string
  llmApiKey: string
  llmModel: string
}

export function getConfig() {
  return request.get<any, { code: number; data: AppConfig }>('/eval/api/v1/config')
}

export function updateConfig(config: Partial<AppConfig>) {
  return request.put<any, { code: number; data: AppConfig }>('/eval/api/v1/config', config)
}
