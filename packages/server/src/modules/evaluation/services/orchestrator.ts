/**
 * 评测编排服务 — 场景化评测
 *
 * 根据 session.sceneType 动态选择评测维度和 Prompt，
 * 顺序调 LLM → 聚合结果 → 100分制打分 → 存入数据库
 */
import { PrismaClient } from '@prisma/client'
import type { SceneType } from '@eval/shared'
import { SCENE_CONFIGS } from '@eval/shared'
import { getLLMProvider } from '../../../llm/providers'
import { getPromptForDimension, getSceneDimensions } from '../../../llm/prompts/promptRouter'
import { calculateScoringDynamic, scaleScore } from './scoring'
import { formatConversation } from '../../../llm/prompts'

const prisma = new PrismaClient()

interface DimensionResult {
  score: number
  reasoning: string
  details: any
}

function parseJSON(text: string): any {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = match ? match[1].trim() : text.trim()
  return JSON.parse(jsonStr)
}

async function evaluateDimension(
  sceneType: SceneType,
  dimensionKey: string,
  conversation: string,
  metrics?: string,
): Promise<DimensionResult> {
  const provider = getLLMProvider()
  const prompt = getPromptForDimension(sceneType, dimensionKey, conversation, metrics)

  try {
    console.log(`[evaluation] starting dimension "${dimensionKey}" (scene: ${sceneType})`)
    const response = await provider.chat(prompt)
    console.log(`[evaluation] dimension "${dimensionKey}" completed`)
    const parsed = parseJSON(response.content)
    return {
      score: parsed.score ?? 0,
      reasoning: parsed.reasoning ?? '',
      details: parsed.details ?? {},
    }
  } catch (err: any) {
    console.error(`[evaluation] dimension "${dimensionKey}" failed:`, err.message)
    throw err
  }
}

export async function runEvaluation(sessionId: number, userId: number) {
  // 1. 读取 session 获取 sceneType
  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session) throw new Error('会话不存在')
  const sceneType = (session.sceneType as SceneType) || 'hybrid'

  // 2. 创建评测记录
  const evaluation = await prisma.evaluation.create({
    data: { sessionId, userId, status: 'running', sceneType },
  })

  try {
    // 3. 加载所有消息
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

    // 4. 获取场景维度配置
    const dimensions = getSceneDimensions(sceneType)

    // 5. 并行评测维度（每批3个）
    const rawScores: Record<string, number> = {}
    const dimensionScores: any[] = []
    const reasonings: Record<string, string> = {}

    const BATCH_SIZE = 3
    for (let i = 0; i < dimensions.length; i += BATCH_SIZE) {
      const batch = dimensions.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(dim => evaluateDimension(sceneType, dim.key, conversation, metrics))
      )

      for (let j = 0; j < batch.length; j++) {
        const dim = batch[j]
        const result = results[j]
        if (result.status === 'fulfilled') {
          rawScores[dim.key] = result.value.score
          reasonings[dim.key] = result.value.reasoning
          dimensionScores.push({
            key: dim.key,
            label: dim.label,
            emoji: dim.emoji,
            score: scaleScore(result.value.score),
            maxScore: dim.maxScore,
            weight: dim.weight,
            reasoning: result.value.reasoning,
            details: result.value.details,
          })
        } else {
          console.error(`[evaluation] dimension "${dim.key}" failed:`, result.reason)
          rawScores[dim.key] = 0
          reasonings[dim.key] = '评测失败'
          dimensionScores.push({
            key: dim.key,
            label: dim.label,
            emoji: dim.emoji,
            score: 0,
            maxScore: dim.maxScore,
            weight: dim.weight,
            reasoning: '评测失败',
            details: {},
          })
        }
      }
    }

    // 6. 计算100分制总分
    const scoring = calculateScoringDynamic(rawScores, dimensions)

    // 7. 生成优化建议（最低分的2个维度）
    const sorted = [...dimensionScores].sort((a, b) => a.score - b.score)
    const suggestions = sorted.slice(0, 2).map((dim) => ({
      dimension: dim.label,
      emoji: dim.emoji,
      reasoning: dim.reasoning,
    }))

    // 8. 生成报告叙述
    const best = dimensionScores.reduce((a, b) => a.score >= b.score ? a : b)
    const worst = dimensionScores.reduce((a, b) => a.score <= b.score ? a : b)
    const sceneLabel = SCENE_CONFIGS[sceneType]?.label || '混合场景'

    let level = '优秀'
    if (scoring.overall < 75) level = '良好'
    if (scoring.overall < 60) level = '一般'
    if (scoring.overall < 40) level = '较差'

    const reportNarrative = `【${sceneLabel}】本次评测综合得分 ${scoring.overall} 分（${scoring.grade} 级），整体表现${level}。` +
      `${best.emoji} ${best.label}表现最佳（${best.score}分），` +
      `${worst.emoji} ${worst.label}有改进空间（${worst.score}分）。` +
      `共评测 ${dimensions.length} 个维度。`

    // 9. 写回数据库
    const updateData: any = {
      status: 'completed',
      sceneType,
      overallScore: scoring.overall,
      dimensionScores,
      suggestions,
      reportNarrative,
      llmModelUsed: getLLMProvider().name,
    }

    // Legacy 字段兼容写入
    for (const dim of dimensionScores) {
      const legacyMap: Record<string, string> = {
        intent: 'intent', context: 'context', persona: 'persona',
        safety: 'safety', performance: 'performance',
      }
      const legacyKey = legacyMap[dim.key]
      if (legacyKey) {
        updateData[`${legacyKey}Score`] = rawScores[dim.key] ?? 0
        updateData[`${legacyKey}Reasoning`] = dim.reasoning
        updateData[`${legacyKey}Details`] = dim.details
      }
    }

    return prisma.evaluation.update({ where: { id: evaluation.id }, data: updateData })
  } catch (err: any) {
    await prisma.evaluation.update({
      where: { id: evaluation.id },
      data: { status: 'failed' },
    })
    throw err
  }
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
      sceneType: true,
      overallScore: true,
      dimensionScores: true,
      intentScore: true,
      contextScore: true,
      personaScore: true,
      safetyScore: true,
      performanceScore: true,
      createdAt: true,
    },
  })
}
