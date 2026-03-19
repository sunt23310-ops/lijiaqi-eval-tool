/**
 * Direct API Adapter
 *
 * 直接调用 LLM 提供商 (OpenAI, Anthropic) 的 API 进行流式聊天。
 * 复用现有 LLM Provider 配置。
 */
import type { ChatAdapter, ChatRequest, ChatStreamCallbacks, ChatResponse } from './types'
import { getConfig } from '../../../config'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export class DirectAPIAdapter implements ChatAdapter {
  readonly type = 'direct-api' as const

  isConfigured(): boolean {
    const config = getConfig()
    if (config.llmProvider === 'openai') return !!config.openaiApiKey
    if (config.llmProvider === 'anthropic') return !!config.anthropicApiKey
    return false
  }

  async stream(request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void> {
    const config = getConfig()

    try {
      if (config.llmProvider === 'anthropic') {
        await this.streamAnthropic(request, callbacks)
      } else {
        await this.streamOpenAI(request, callbacks)
      }
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

  private async streamOpenAI(request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void> {
    const config = getConfig()
    const client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseUrl || undefined,
      timeout: 30_000,
      maxRetries: 0,
    })

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = request.messages.length > 0
      ? request.messages.map(m => ({ role: m.role, content: m.content }))
      : [{ role: 'user', content: request.content }]

    const stream = await client.chat.completions.create({
      model: config.openaiModel || 'gpt-4o',
      messages,
      stream: true,
      temperature: 0.7,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) {
        callbacks.onChunk(delta)
      }
    }

    callbacks.onDone()
  }

  private async streamAnthropic(request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void> {
    const config = getConfig()
    const client = new Anthropic({ apiKey: config.anthropicApiKey })

    const messages: Anthropic.MessageParam[] = request.messages.length > 0
      ? request.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      : [{ role: 'user', content: request.content }]

    const stream = client.messages.stream({
      model: config.anthropicModel || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages,
    })

    stream.on('text', (text) => {
      callbacks.onChunk(text)
    })

    await stream.finalMessage()
    callbacks.onDone()
  }
}
