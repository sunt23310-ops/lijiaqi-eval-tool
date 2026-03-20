/**
 * Mock 数据服务
 *
 * 1. 预设场景 — 从 QA 对话库加载真实对话数据
 * 2. AI 动态生成 — 调 LLM 生成模拟追问
 */
import { getLLMProvider } from '../llm/providers'
import { MOCK_GENERATE_PROMPT, formatConversation } from '../llm/prompts'
import qaPresets from '../../data/qa-presets.json'

interface QAPreset {
  key: string
  name: string
  description: string
  sceneType: string
  sceneLabel: string
  category: string
  rounds: number
  messages: string[]
}

// 为每个场景添加 emoji
const SCENE_EMOJIS: Record<string, string> = {
  consult: '🧴',
  promo: '🎉',
  service: '🔧',
  chat: '💬',
  hybrid: '🔄',
}

export function getPresets() {
  return (qaPresets as QAPreset[]).map(p => ({
    key: p.key,
    name: p.name,
    emoji: SCENE_EMOJIS[p.sceneType] || '📋',
    description: p.description,
    sceneType: p.sceneType,
    sceneLabel: p.sceneLabel,
    category: p.category,
    rounds: p.rounds,
    messages: p.messages,
  }))
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

  const questions = parsed.questions ?? []
  // LLM 返回 { type, content, test_focus } 对象，前端只需要 content 字符串
  return questions.map((q: any) => (typeof q === 'string' ? q : q.content || String(q)))
}
