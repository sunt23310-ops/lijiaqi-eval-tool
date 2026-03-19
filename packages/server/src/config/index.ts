/**
 * 全局配置管理
 *
 * 优先从数据库 system_config 读取，降级到环境变量。
 */

import type { ChatAdapterType } from '@eval/shared'

export interface AppConfig {
  chatAdapterType: ChatAdapterType
  sseApiBaseUrl: string
  sseApiToken: string
  llmProvider: 'openai' | 'anthropic'
  openaiApiKey: string
  openaiModel: string
  openaiBaseUrl: string
  anthropicApiKey: string
  anthropicModel: string
  customEndpoint: string
  customAuthType: 'bearer' | 'header' | 'none'
  customAuthValue: string
  customHeaders: Record<string, string>
}

/** 内存缓存，服务启动时从 env 加载 */
let config: AppConfig = loadFromEnv()

function loadFromEnv(): AppConfig {
  return {
    chatAdapterType: (process.env.CHAT_ADAPTER_TYPE as ChatAdapterType) || 'sse-proxy',
    sseApiBaseUrl: process.env.SSE_API_BASE_URL || '',
    sseApiToken: process.env.SSE_API_TOKEN || '',
    llmProvider: (process.env.LLM_PROVIDER as 'openai' | 'anthropic') || 'openai',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
    openaiBaseUrl: process.env.OPENAI_BASE_URL || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    customEndpoint: process.env.CUSTOM_ENDPOINT || '',
    customAuthType: (process.env.CUSTOM_AUTH_TYPE as 'bearer' | 'header' | 'none') || 'none',
    customAuthValue: process.env.CUSTOM_AUTH_VALUE || '',
    customHeaders: {},
  }
}

export function getConfig(): AppConfig {
  return config
}

export function updateConfig(partial: Partial<AppConfig>) {
  config = { ...config, ...partial }
}
