/**
 * ChatAdapter 工厂
 *
 * 根据配置返回对应的 adapter 实例。
 * 当选定 adapter 未配置时，降级到 mock 模式。
 */
import type { ChatAdapterType } from '@eval/shared'
import type { ChatAdapter } from './types'
import { SSEProxyAdapter } from './sse-proxy.adapter'
import { DirectAPIAdapter } from './direct-api.adapter'
import { CustomAdapter } from './custom.adapter'
import { getConfig } from '../../../config'

const adapters: Record<ChatAdapterType, () => ChatAdapter> = {
  'sse-proxy': () => new SSEProxyAdapter(),
  'direct-api': () => new DirectAPIAdapter(),
  'custom': () => new CustomAdapter(),
}

/**
 * 创建并返回当前配置的 adapter 实例。
 * 如果指定类型，则优先使用指定类型。
 */
export function createAdapter(type?: ChatAdapterType): ChatAdapter {
  const adapterType = type ?? getConfig().chatAdapterType ?? 'sse-proxy'
  const factory = adapters[adapterType]
  if (!factory) {
    return new SSEProxyAdapter()
  }
  return factory()
}

/**
 * 返回当前配置的 adapter 是否可用。
 * 如果不可用，chat 路由应降级到 mock 模式。
 */
export function isAdapterConfigured(type?: ChatAdapterType): boolean {
  const adapter = createAdapter(type)
  return adapter.isConfigured()
}
