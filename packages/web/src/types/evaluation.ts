export interface DimensionScore {
  score: number
  reasoning: string
  details: Record<string, any>
}

export interface Evaluation {
  id: number
  sessionId: number
  status: string
  overallScore: number
  intentScore: number
  intentReasoning: string
  intentDetails: Record<string, any>
  contextScore: number
  contextReasoning: string
  contextDetails: Record<string, any>
  fluencyScore: number
  fluencyReasoning: string
  fluencyDetails: Record<string, any>
  safetyScore: number
  safetyReasoning: string
  safetyDetails: Record<string, any>
  performanceScore: number
  performanceReasoning: string
  performanceDetails: Record<string, any>
  suggestions: string[]
  reportNarrative: string
  llmModelUsed: string
  createdAt: string
}

export interface EvaluationSummary {
  id: number
  sessionId: number
  overallScore: number
  status: string
  createdAt: string
  intentScore: number
  contextScore: number
  fluencyScore: number
  safetyScore: number
  performanceScore: number
}

export const DIMENSION_CONFIG = [
  { key: 'intent', label: '意图识别', emoji: '🎯', weight: 0.2 },
  { key: 'context', label: '上下文理解', emoji: '🔗', weight: 0.2 },
  { key: 'fluency', label: '表达拟人度', emoji: '🎭', weight: 0.25 },
  { key: 'safety', label: '内容安全', emoji: '🛡️', weight: 0.2 },
  { key: 'performance', label: '响应性能', emoji: '⚡', weight: 0.15 },
] as const

export type DimensionKey = typeof DIMENSION_CONFIG[number]['key']
