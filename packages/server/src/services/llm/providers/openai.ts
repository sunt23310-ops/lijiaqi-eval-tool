/**
 * OpenAI Provider
 */
import OpenAI from 'openai'
import type { LLMProvider, LLMResponse } from './base'

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai'
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model = 'gpt-4o', baseURL?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
      timeout: 55_000,   // 55 秒超时（Vercel 函数最大 60 秒）
      maxRetries: 1,
    })
    this.model = model
  }

  async chat(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 8192,
    })

    return {
      content: response.choices[0]?.message?.content ?? '',
      model: response.model,
      usage: response.usage
        ? { promptTokens: response.usage.prompt_tokens, completionTokens: response.usage.completion_tokens }
        : undefined,
    }
  }
}
