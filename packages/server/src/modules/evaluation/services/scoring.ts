/**
 * 评分计算器 — 100 分制
 *
 * 将 LLM 返回的 1-10 分制映射到 100 分制，
 * 并按维度权重计算加权总分。
 */

export interface DimensionScore {
  /** 原始 1-10 分 */
  raw: number
  /** 100 分制 */
  scaled: number
  /** 权重 (0-1) */
  weight: number
}

export interface ScoringResult {
  /** 各维度得分 */
  dimensions: Record<string, DimensionScore>
  /** 加权总分 (0-100) */
  overall: number
  /** 等级 */
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
}

/** 默认维度权重 */
const DEFAULT_WEIGHTS: Record<string, number> = {
  intent: 0.20,
  context: 0.20,
  persona: 0.25,
  safety: 0.20,
  performance: 0.15,
}

/**
 * 将 1-10 分映射到 100 分制
 * 使用分段线性映射，避免简单 *10 导致区分度不足
 */
export function scaleScore(raw: number): number {
  if (raw <= 0) return 0
  if (raw >= 10) return 100

  // 分段映射:
  //   1-2  → 10-30  (差)
  //   3-4  → 30-50  (较差)
  //   5-6  → 50-70  (一般)
  //   7-8  → 70-85  (良好)
  //   9-10 → 85-100 (优秀)
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

/**
 * 根据总分返回等级
 */
export function getGrade(overall: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (overall >= 90) return 'S'
  if (overall >= 75) return 'A'
  if (overall >= 60) return 'B'
  if (overall >= 40) return 'C'
  return 'D'
}

/**
 * 计算 100 分制加权总分
 */
export function calculateScoring(
  rawScores: Record<string, number>,
  weights: Record<string, number> = DEFAULT_WEIGHTS
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
