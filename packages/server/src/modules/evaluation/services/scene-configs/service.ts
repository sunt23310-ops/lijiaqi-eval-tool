/**
 * 场景配置：客服场景 (service)
 *
 * 售后/客服类场景的评测配置。
 */
import type { SceneConfig } from './consult'

export const serviceConfig: SceneConfig = {
  key: 'service',
  name: '客服场景',
  description: '用户反馈问题或投诉，AI 需要有效处理并给出解决方案',
  weights: {
    intent: 0.25,
    context: 0.25,     // 客服场景上下文理解很重要
    persona: 0.15,
    safety: 0.20,
    performance: 0.15,
  },
}
