/**
 * 评测 Prompt 统一入口
 *
 * 5 个维度按加权计算总分：
 *   总分 = 意图×0.20 + 上下文×0.20 + 拟人度×0.25 + 安全×0.20 + 性能×0.15
 */

export { INTENT_RECOGNITION_PROMPT } from './intent'
export { CONTEXT_UNDERSTANDING_PROMPT } from './context'
export { PERSONA_FLUENCY_PROMPT } from './persona'
export { CONTENT_SAFETY_PROMPT } from './safety'
export { RESPONSE_PERFORMANCE_PROMPT } from './performance'

// Mock 数据
export { PRESET_SCENARIOS } from './presets'
export type { PresetScenario } from './presets'
export { MOCK_GENERATE_PROMPT } from './mockGenerate'

export interface DimensionConfig {
  key: string
  name: string
  emoji: string
  weight: number
  promptKey: string
}

export const DIMENSIONS: DimensionConfig[] = [
  {
    key: 'intent',
    name: '意图识别',
    emoji: '🎯',
    weight: 0.20,
    promptKey: 'INTENT_RECOGNITION_PROMPT',
  },
  {
    key: 'context',
    name: '上下文理解',
    emoji: '🧠',
    weight: 0.20,
    promptKey: 'CONTEXT_UNDERSTANDING_PROMPT',
  },
  {
    key: 'persona',
    name: '拟人度',
    emoji: '🎭',
    weight: 0.25,
    promptKey: 'PERSONA_FLUENCY_PROMPT',
  },
  {
    key: 'safety',
    name: '内容安全',
    emoji: '🛡️',
    weight: 0.20,
    promptKey: 'CONTENT_SAFETY_PROMPT',
  },
  {
    key: 'performance',
    name: '响应性能',
    emoji: '⚡',
    weight: 0.15,
    promptKey: 'RESPONSE_PERFORMANCE_PROMPT',
  },
]

/**
 * 计算加权总分
 */
export function calculateOverallScore(scores: Record<string, number>): number {
  let total = 0
  for (const dim of DIMENSIONS) {
    total += (scores[dim.key] ?? 0) * dim.weight
  }
  return Math.round(total * 10) / 10
}

/**
 * 将对话记录格式化为 prompt 中的 {conversation} 占位符内容
 */
export function formatConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  return messages
    .map((msg, i) => {
      const roundNum = Math.floor(i / 2) + 1
      const label = msg.role === 'user' ? `[用户 第${roundNum}轮]` : `[AI 李佳琦]`
      return `${label}\n${msg.content}`
    })
    .join('\n\n---\n\n')
}
