/**
 * 评测编排服务
 *
 * 加载消息 → 填充 5 个维度 prompt → 并行调 LLM → 聚合结果 → 存入数据库
 */
import { PrismaClient } from '@prisma/client'
import { getLLMProvider } from '../llm/providers'
import {
  INTENT_RECOGNITION_PROMPT,
  CONTEXT_UNDERSTANDING_PROMPT,
  PERSONA_FLUENCY_PROMPT,
  CONTENT_SAFETY_PROMPT,
  RESPONSE_PERFORMANCE_PROMPT,
  DIMENSIONS,
  calculateOverallScore,
  formatConversation,
} from '../llm/prompts'

const prisma = new PrismaClient()

const PROMPT_MAP: Record<string, string> = {
  intent: INTENT_RECOGNITION_PROMPT,
  context: CONTEXT_UNDERSTANDING_PROMPT,
  persona: PERSONA_FLUENCY_PROMPT,
  safety: CONTENT_SAFETY_PROMPT,
  performance: RESPONSE_PERFORMANCE_PROMPT,
}

interface DimensionResult {
  score: number
  reasoning: string
  details: any
}

function parseJSON(text: string): any {
  // 尝试从 markdown 代码块中提取 JSON
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = match ? match[1].trim() : text.trim()
  return JSON.parse(jsonStr)
}

async function evaluateDimension(key: string, conversation: string, metrics?: string): Promise<DimensionResult> {
  const provider = getLLMProvider()
  let prompt = PROMPT_MAP[key].replace('{conversation}', conversation)

  if (key === 'performance' && metrics) {
    prompt = prompt.replace('{metrics}', metrics)
  }

  const response = await provider.chat(prompt)
  const parsed = parseJSON(response.content)

  return {
    score: parsed.score ?? 0,
    reasoning: parsed.reasoning ?? '',
    details: parsed.details ?? {},
  }
}

export async function runEvaluation(sessionId: number, userId: number) {
  // 1. 创建评测记录
  const evaluation = await prisma.evaluation.create({
    data: { sessionId, userId, status: 'running' },
  })

  try {
    // 2. 加载所有消息
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })

    if (messages.length === 0) {
      await prisma.evaluation.update({
        where: { id: evaluation.id },
        data: { status: 'failed' },
      })
      throw new Error('会话中没有消息，无法评测')
    }

    const conversation = formatConversation(
      messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    )

    // 性能指标汇总
    const aiMessages = messages.filter((m) => m.role === 'assistant')
    const metrics = JSON.stringify({
      total_rounds: aiMessages.length,
      avg_ttft_ms: aiMessages.reduce((s, m) => s + (m.ttftMs ?? 0), 0) / (aiMessages.length || 1),
      avg_latency_ms: aiMessages.reduce((s, m) => s + (m.latencyMs ?? 0), 0) / (aiMessages.length || 1),
      error_count: aiMessages.filter((m) => !m.content).length,
    })

    // 3. 并行调 5 个维度
    const results = await Promise.allSettled(
      DIMENSIONS.map((dim) => evaluateDimension(dim.key, conversation, metrics))
    )

    // 4. 聚合结果
    const scores: Record<string, number> = {}
    const updateData: any = { status: 'completed', llmModelUsed: getLLMProvider().name }

    DIMENSIONS.forEach((dim, i) => {
      const result = results[i]
      if (result.status === 'fulfilled') {
        scores[dim.key] = result.value.score
        updateData[`${dim.key}Score`] = result.value.score
        updateData[`${dim.key}Reasoning`] = result.value.reasoning
        updateData[`${dim.key}Details`] = result.value.details
      } else {
        scores[dim.key] = 0
        updateData[`${dim.key}Score`] = 0
        updateData[`${dim.key}Reasoning`] = `评测失败: ${result.reason?.message ?? 'unknown'}`
      }
    })

    updateData.overallScore = calculateOverallScore(scores)

    // 5. 生成优化建议（用最低分的 2 个维度）
    const sorted = [...DIMENSIONS].sort((a, b) => (scores[a.key] ?? 0) - (scores[b.key] ?? 0))
    updateData.suggestions = sorted.slice(0, 2).map((dim) => ({
      dimension: dim.name,
      emoji: dim.emoji,
      reasoning: updateData[`${dim.key}Reasoning`],
    }))

    // 6. 生成报告叙述
    updateData.reportNarrative = generateNarrative(scores, updateData)

    // 7. 写回数据库
    return prisma.evaluation.update({ where: { id: evaluation.id }, data: updateData })
  } catch (err: any) {
    await prisma.evaluation.update({
      where: { id: evaluation.id },
      data: { status: 'failed' },
    })
    throw err
  }
}

function generateNarrative(scores: Record<string, number>, data: any): string {
  const overall = data.overallScore
  const best = DIMENSIONS.reduce((a, b) => ((scores[a.key] ?? 0) >= (scores[b.key] ?? 0) ? a : b))
  const worst = DIMENSIONS.reduce((a, b) => ((scores[a.key] ?? 0) <= (scores[b.key] ?? 0) ? a : b))

  let level = '优秀'
  if (overall < 8) level = '良好'
  if (overall < 6) level = '一般'
  if (overall < 4) level = '较差'

  return `本次评测综合得分 ${overall}，整体表现${level}。` +
    `${best.emoji} ${best.name}表现最佳（${scores[best.key]}分），` +
    `${worst.emoji} ${worst.name}有改进空间（${scores[worst.key]}分）。` +
    (data.safetyReasoning ? `安全维度：${data.safetyReasoning}` : '')
}

export async function getEvaluation(evalId: number) {
  return prisma.evaluation.findUnique({ where: { id: evalId } })
}

export async function listEvaluations(sessionId: number) {
  return prisma.evaluation.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      sessionId: true,
      status: true,
      overallScore: true,
      intentScore: true,
      contextScore: true,
      personaScore: true,
      safetyScore: true,
      performanceScore: true,
      createdAt: true,
    },
  })
}
