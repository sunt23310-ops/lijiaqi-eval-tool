/**
 * LLM Provider 工厂
 *
 * 根据配置返回对应的 provider 实例，全局单例。
 */
import type { LLMProvider } from './base'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import { getConfig } from '../../config'

let cachedProvider: LLMProvider | null = null
let cachedKey = ''

export function getLLMProvider(): LLMProvider {
  const config = getConfig()
  const key = `${config.llmProvider}:${config.openaiApiKey}:${config.anthropicApiKey}`

  if (cachedProvider && cachedKey === key) return cachedProvider

  switch (config.llmProvider) {
    case 'anthropic':
      cachedProvider = new AnthropicProvider(config.anthropicApiKey, config.anthropicModel)
      break
    case 'openai':
    default:
      cachedProvider = new OpenAIProvider(config.openaiApiKey, config.openaiModel, config.openaiBaseUrl)
      break
  }

  cachedKey = key
  return cachedProvider
}

export function resetProviderCache() {
  cachedProvider = null
  cachedKey = ''
}
