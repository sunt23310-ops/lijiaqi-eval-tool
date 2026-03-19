/**
 * 场景配置：咨询场景 (consult)
 *
 * 美妆护肤咨询类场景的评测配置，
 * 包括维度权重调整和场景特定的评测标准。
 */

export interface SceneConfig {
  key: string
  name: string
  description: string
  /** 维度权重覆盖（未指定的维度使用默认权重） */
  weights?: Partial<Record<string, number>>
  /** 场景特定的评测提示词补充 */
  promptOverrides?: Partial<Record<string, string>>
}

export const consultConfig: SceneConfig = {
  key: 'consult',
  name: '咨询场景',
  description: '用户主动咨询护肤/美妆问题，AI 需要准确理解需求并给出专业建议',
  weights: {
    intent: 0.25,     // 咨询场景中意图识别更重要
    context: 0.20,
    persona: 0.20,
    safety: 0.20,
    performance: 0.15,
  },
}
