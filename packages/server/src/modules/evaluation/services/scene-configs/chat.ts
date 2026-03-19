/**
 * 场景配置：闲聊场景 (chat)
 *
 * 日常闲聊类场景的评测配置。
 */
import type { SceneConfig } from './consult'

export const chatConfig: SceneConfig = {
  key: 'chat',
  name: '闲聊场景',
  description: '用户与 AI 进行日常闲聊，AI 需要自然地引导到美妆话题',
  weights: {
    intent: 0.15,
    context: 0.20,
    persona: 0.35,     // 闲聊场景拟人度权重最高
    safety: 0.15,
    performance: 0.15,
  },
}
