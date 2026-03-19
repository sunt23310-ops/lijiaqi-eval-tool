/**
 * 场景特定 Prompt 模板
 *
 * 各场景可以在基础维度 prompt 之上添加场景特定的评测指引。
 * 导出的 Map 结构: scene-key → dimension-key → prompt supplement
 */

export { CONSULT_PROMPTS } from './consult'
export { PROMO_PROMPTS } from './promo'
export { SERVICE_PROMPTS } from './service'
export { CHAT_PROMPTS } from './chat'
export { HYBRID_PROMPTS } from './hybrid'

export type ScenePromptMap = Record<string, string>
