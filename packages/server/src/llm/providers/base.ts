/**
 * LLM Provider 抽象接口
 *
 * 所有外部 LLM 调用（评测、AI 生成）都通过此接口，
 * 通过配置切换 OpenAI / Anthropic 实现。
 */

export interface LLMResponse {
  content: string
  model: string
  usage?: { promptTokens: number; completionTokens: number }
}

export interface LLMProvider {
  readonly name: string
  chat(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse>
}
