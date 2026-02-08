/**
 * Mock 数据服务
 *
 * 1. 预设场景 — 返回静态数据
 * 2. AI 动态生成 — 调 LLM 生成模拟追问
 */
import { getLLMProvider } from '../llm/providers'
import { PRESET_SCENARIOS, MOCK_GENERATE_PROMPT, formatConversation } from '../llm/prompts'

export function getPresets() {
  return PRESET_SCENARIOS
}

export async function generateMockQuestions(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  const provider = getLLMProvider()
  const conversation = formatConversation(messages)
  const roundCount = Math.ceil(messages.length / 2)

  const prompt = MOCK_GENERATE_PROMPT
    .replace('{conversation}', conversation)
    .replace('{round_count}', String(roundCount))

  const response = await provider.chat(prompt, { temperature: 0.7 })

  // 解析 JSON
  const match = response.content.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = match ? match[1].trim() : response.content.trim()
  const parsed = JSON.parse(jsonStr)

  return parsed.questions ?? []
}
