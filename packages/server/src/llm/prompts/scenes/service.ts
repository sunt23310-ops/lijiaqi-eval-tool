/**
 * 客服场景 Prompt 补充
 */
import type { ScenePromptMap } from './index'

export const SERVICE_PROMPTS: ScenePromptMap = {
  intent: `
## 场景补充：客服场景
在客服场景中，请额外关注：
- AI 是否准确识别了用户的问题类型（投诉、退换货、使用问题）
- 是否给出了有效的解决方案
`,
  context: `
## 场景补充：客服场景
在客服场景中，请额外关注：
- AI 是否完整记录并追踪了用户的问题
- 后续回复是否围绕问题解决而非偏离主题
`,
}
