/**
 * Custom Adapter
 *
 * 连接用户自定义的模型端点。
 * 支持 bearer token、自定义 header、无认证三种模式。
 * 期望端点返回 SSE 格式流或 JSON 响应。
 */
import type { ChatAdapter, ChatRequest, ChatStreamCallbacks, ChatResponse } from './types'
import { getConfig } from '../../../config'

export class CustomAdapter implements ChatAdapter {
  readonly type = 'custom' as const

  isConfigured(): boolean {
    return !!getConfig().customEndpoint
  }

  async stream(request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void> {
    const config = getConfig()

    if (!config.customEndpoint) {
      callbacks.onError(new Error('Custom endpoint is not configured'))
      return
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.customHeaders,
      }

      // Auth
      if (config.customAuthType === 'bearer' && config.customAuthValue) {
        headers['Authorization'] = `Bearer ${config.customAuthValue}`
      } else if (config.customAuthType === 'header' && config.customAuthValue) {
        headers['X-API-Key'] = config.customAuthValue
      }

      const body = {
        messages: request.messages.length > 0
          ? request.messages
          : [{ role: 'user', content: request.content }],
        stream: true,
      }

      const response = await fetch(config.customEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        callbacks.onError(new Error(`Custom endpoint error: ${response.status} ${response.statusText}`))
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        callbacks.onDone()
        return
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // Parse SSE format
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '[DONE]' || data === '[Done]') {
              callbacks.onDone()
              return
            }
            try {
              const parsed = JSON.parse(data)
              // Support OpenAI-compatible format
              const content = parsed.choices?.[0]?.delta?.content ?? parsed.content ?? ''
              if (content) {
                callbacks.onChunk(content)
              }
            } catch {
              // Not JSON, pass raw
              if (data) callbacks.onChunk(data)
            }
          }
        }
      }

      callbacks.onDone()
    } catch (err: any) {
      callbacks.onError(err)
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    let content = ''
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      this.stream(request, {
        onChunk: (text) => { content += text },
        onDone: () => {
          resolve({ content, latencyMs: Date.now() - startTime })
        },
        onError: (error) => { reject(error) },
      })
    })
  }
}
