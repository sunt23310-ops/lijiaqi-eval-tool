/**
 * 咨询场景 Prompt 补充
 */
import type { ScenePromptMap } from './index'

export const CONSULT_PROMPTS: ScenePromptMap = {
  intent: `
## 场景补充：咨询场景
在咨询场景中，请额外关注：
- AI 是否准确识别了咨询类型（产品咨询、成分咨询、方案咨询）
- 是否针对用户的具体问题给出了有针对性的回答
`,
  context: `
## 场景补充：咨询场景
在咨询场景中，请额外关注：
- AI 是否记住了用户的肤质、过敏史等关键信息
- 后续推荐是否基于之前收集的信息
`,
}
