/**
 * Anthropic Provider
 */
import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, LLMResponse } from './base'

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic'
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey })
    this.model = model
  }

  async chat(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')

    return {
      content: textBlock?.type === 'text' ? textBlock.text : '',
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
      },
    }
  }
}
