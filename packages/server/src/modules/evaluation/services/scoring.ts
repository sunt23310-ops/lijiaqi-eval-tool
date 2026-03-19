/**
 * 评分计算器 — 100 分制
 *
 * 将 LLM 返回的 1-10 分制映射到 100 分制，
 * 并按维度权重计算加权总分。
 * 支持动态维度（场景化评测）。
 */
import type { DimensionConfig } from '@eval/shared'

export interface DimensionScore {
  raw: number
  scaled: number
  weight: number
}

export interface ScoringResult {
  dimensions: Record<string, DimensionScore>
  overall: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
}

/**
 * 将 1-10 分映射到 100 分制
 */
export function scaleScore(raw: number): number {
  if (raw <= 0) return 0
  if (raw >= 10) return 100

  const segments: [number, number, number, number][] = [
    [1, 2, 10, 30],
    [3, 4, 30, 50],
    [5, 6, 50, 70],
    [7, 8, 70, 85],
    [9, 10, 85, 100],
  ]

  for (const [minRaw, maxRaw, minScaled, maxScaled] of segments) {
    if (raw >= minRaw && raw <= maxRaw) {
      const ratio = (raw - minRaw) / (maxRaw - minRaw)
      return Math.round(minScaled + ratio * (maxScaled - minScaled))
    }
  }

  return Math.round(raw * 10)
}

export function getGrade(overall: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (overall >= 90) return 'S'
  if (overall >= 75) return 'A'
  if (overall >= 60) return 'B'
  if (overall >= 40) return 'C'
  return 'D'
}

/**
 * 使用动态维度配置计算评分
 * @param rawScores - 各维度的原始 1-10 分
 * @param dimensions - 场景维度配置数组
 */
export function calculateScoringDynamic(
  rawScores: Record<string, number>,
  dimensions: DimensionConfig[],
): ScoringResult {
  const result: Record<string, DimensionScore> = {}
  let weightedSum = 0
  let totalWeight = 0

  for (const dim of dimensions) {
    const raw = rawScores[dim.key] ?? 0
    const weight = dim.weight / 100 // weight in config is 0-100, convert to 0-1
    const scaled = scaleScore(raw)
    result[dim.key] = { raw, scaled, weight }
    weightedSum += scaled * weight
    totalWeight += weight
  }

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  const grade = getGrade(overall)

  return { dimensions: result, overall, grade }
}

/**
 * Legacy: 计算固定5维度的加权总分（兼容旧代码）
 */
const DEFAULT_WEIGHTS: Record<string, number> = {
  intent: 0.20,
  context: 0.20,
  persona: 0.25,
  safety: 0.20,
  performance: 0.15,
}

export function calculateScoring(
  rawScores: Record<string, number>,
  weights: Record<string, number> = DEFAULT_WEIGHTS,
): ScoringResult {
  const dimensions: Record<string, DimensionScore> = {}
  let weightedSum = 0
  let totalWeight = 0

  for (const [key, raw] of Object.entries(rawScores)) {
    const weight = weights[key] ?? 0
    const scaled = scaleScore(raw)
    dimensions[key] = { raw, scaled, weight }
    weightedSum += scaled * weight
    totalWeight += weight
  }

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  const grade = getGrade(overall)

  return { dimensions, overall, grade }
}
