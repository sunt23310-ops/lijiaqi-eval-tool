/**
 * 场景配置：推广场景 (promo)
 *
 * 产品推荐/促销类场景的评测配置。
 */
import type { SceneConfig } from './consult'

export const promoConfig: SceneConfig = {
  key: 'promo',
  name: '推广场景',
  description: 'AI 主动推荐产品，需要自然融入推广内容而不显得过于营销',
  weights: {
    intent: 0.15,
    context: 0.15,
    persona: 0.30,     // 推广场景中拟人度/感染力更重要
    safety: 0.25,       // 需要关注是否过度营销
    performance: 0.15,
  },
}
