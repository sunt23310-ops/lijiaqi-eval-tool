/**
 * 场景配置：混合场景 (hybrid)
 *
 * 混合多种对话类型的场景评测配置。
 */
import type { SceneConfig } from './consult'

export const hybridConfig: SceneConfig = {
  key: 'hybrid',
  name: '混合场景',
  description: '对话中包含多种类型（咨询、闲聊、推荐），AI 需要灵活切换',
  weights: {
    intent: 0.20,
    context: 0.25,     // 混合场景需要更好的上下文切换能力
    persona: 0.20,
    safety: 0.20,
    performance: 0.15,
  },
}
