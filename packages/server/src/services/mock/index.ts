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

  // 健壮的 JSON 解析：处理 Gemini 等模型返回非标准格式
  const raw = response.content
  console.log('[mock/generate] raw LLM response (first 300 chars):', raw.slice(0, 300))

  let parsed: any
  try {
    // 尝试1：提取 ```json ... ``` 块
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = match ? match[1].trim() : raw.trim()
    parsed = JSON.parse(jsonStr)
  } catch {
    try {
      // 尝试2：提取第一个 { ... } 或 [ ... ]
      const objMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (objMatch) {
        parsed = JSON.parse(objMatch[1])
      } else {
        throw new Error('无法从 LLM 响应中提取 JSON')
      }
    } catch (e2: any) {
      console.error('[mock/generate] JSON parse failed:', e2.message, '\nraw:', raw.slice(0, 500))
      throw new Error('LLM 返回格式异常，无法解析')
    }
  }

  const questions = parsed.questions ?? []
  // LLM 返回 { type, content, test_focus } 对象，前端只需要 content 字符串
  return questions.map((q: any) => (typeof q === 'string' ? q : q.content || String(q)))
}
