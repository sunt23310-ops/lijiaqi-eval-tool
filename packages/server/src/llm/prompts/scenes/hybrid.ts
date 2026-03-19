/**
 * 混合场景 Prompt 补充
 */
import type { ScenePromptMap } from './index'

export const HYBRID_PROMPTS: ScenePromptMap = {
  context: `
## 场景补充：混合场景
在混合场景中，请额外关注：
- AI 在不同话题类型切换时是否保持了上下文连贯性
- 从闲聊到咨询、从咨询到推荐的过渡是否自然
`,
  persona: `
## 场景补充：混合场景
在混合场景中，请额外关注：
- AI 在不同对话类型中是否始终保持李佳琦的人设
- 切换话题时语气和风格是否一致
`,
}
