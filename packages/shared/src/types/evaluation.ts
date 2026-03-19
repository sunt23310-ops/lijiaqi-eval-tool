import type { SceneType } from './session'

/**
 * Single dimension score within an evaluation
 */
export interface DimensionScore {
  key: string
  label: string
  emoji: string
  score: number
  maxScore: number
  weight: number
  reasoning: string
  details: Record<string, any>
}

/**
 * Checklist item result (for chat scene)
 */
export interface ChecklistItem {
  id: string
  category: 'persona' | 'emotion' | 'naturalness' | 'profile'
  categoryLabel: string
  description: string
  passed: boolean
  note?: string
}

/**
 * Age stratification data (for chat scene)
 */
export interface AgeStratification {
  ageGroup: '35plus' | 'under35'
  label: string
  guidelines: string[]
  compliance: number // 0-100
}

/**
 * Full evaluation result (new scene-based format)
 */
export interface Evaluation {
  id: number
  sessionId: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  sceneType: SceneType
  overallScore: number // 0-100 scale
  dimensionScores: DimensionScore[]
  checklistResults?: ChecklistItem[] // chat scene only
  ageStratification?: AgeStratification // chat scene only
  suggestions: Array<{ dimension: string; emoji: string; reasoning: string }>
  reportNarrative: string
  llmModelUsed: string
  createdAt: string

  // Legacy fields (kept during migration, will be removed)
  intentScore?: number
  intentReasoning?: string
  intentDetails?: Record<string, any>
  contextScore?: number
  contextReasoning?: string
  contextDetails?: Record<string, any>
  personaScore?: number
  personaReasoning?: string
  personaDetails?: Record<string, any>
  safetyScore?: number
  safetyReasoning?: string
  safetyDetails?: Record<string, any>
  performanceScore?: number
  performanceReasoning?: string
  performanceDetails?: Record<string, any>
}

export interface EvaluationSummary {
  id: number
  sessionId: number
  sceneType: SceneType
  overallScore: number
  status: string
  createdAt: string
  dimensionScores?: DimensionScore[]
}
