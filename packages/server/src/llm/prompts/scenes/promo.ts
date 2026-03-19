/**
 * 推广场景 Prompt 补充
 */
import type { ScenePromptMap } from './index'

export const PROMO_PROMPTS: ScenePromptMap = {
  persona: `
## 场景补充：推广场景
在推广场景中，请额外关注：
- AI 是否自然地融入产品推荐，而非生硬推销
- 是否保持了李佳琦推荐产品时的热情和感染力
`,
  safety: `
## 场景补充：推广场景
在推广场景中，请额外关注：
- 是否存在过度营销或制造恐慌式推销
- 是否尊重用户的预算限制
`,
}
