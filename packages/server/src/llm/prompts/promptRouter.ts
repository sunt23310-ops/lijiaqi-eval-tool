/**
 * Prompt 路由器
 *
 * 根据场景类型和维度 key 返回对应的评测 Prompt。
 * - 对于基础维度（intent/context/persona/safety/performance），使用已有 Prompt
 * - 对于场景特有维度，使用通用模板 + 场景上下文
 */
import type { SceneType, DimensionConfig } from '@eval/shared'
import { SCENE_CONFIGS } from '@eval/shared'
import { INTENT_RECOGNITION_PROMPT } from './intent'
import { CONTEXT_UNDERSTANDING_PROMPT } from './context'
import { PERSONA_FLUENCY_PROMPT } from './persona'
import { CONTENT_SAFETY_PROMPT } from './safety'
import { RESPONSE_PERFORMANCE_PROMPT } from './performance'

/** 基础维度 Prompt 映射（兼容原5维度） */
const BASE_PROMPTS: Record<string, string> = {
  intent: INTENT_RECOGNITION_PROMPT,
  context: CONTEXT_UNDERSTANDING_PROMPT,
  persona: PERSONA_FLUENCY_PROMPT,
  safety: CONTENT_SAFETY_PROMPT,
  performance: RESPONSE_PERFORMANCE_PROMPT,
}

/** 场景上下文描述 */
const SCENE_CONTEXT: Record<SceneType, string> = {
  consult: '护肤咨询与商品推荐场景。用户咨询护肤方案、产品推荐、成分问题。AI 扮演李佳琦提供专业建议。',
  promo: '大促活动与商品讲解场景。用户询问活动规则、优惠信息、商品详情。AI 扮演李佳琦讲解大促信息。',
  service: '售后服务与投诉处理场景。用户反映商品问题、要求退换货、表达不满。AI 扮演李佳琦处理售后。',
  chat: '日常闲聊与情感交流场景。用户进行非商品相关的闲聊、分享心情。AI 扮演李佳琦陪伴聊天。',
  hybrid: '混合场景，包含多种对话类型（咨询+闲聊+售后等）。AI 需在不同场景间流畅切换。',
}

/** 维度特有的评分指南 */
const DIMENSION_GUIDES: Record<string, string> = {
  // consult 场景
  diagnosis: `评估AI是否准确识别用户的肤质、诉求和护肤需求：
- 是否主动询问肤质、过敏史等关键信息
- 是否根据用户描述做出合理判断
- 是否避免在信息不足时盲目推荐`,

  recommendation: `评估AI推荐的产品/方案是否合理匹配用户需求：
- 推荐产品是否与用户肤质、预算、需求匹配
- 是否提供多个选择而非单一推荐
- 推荐理由是否充分（成分、功效、适用肤质）`,

  coherence: `评估多轮对话中的信息衔接和上下文连贯性：
- 是否记住前文提到的用户信息（肤质、预算、过敏史）
- 是否在后续推荐中引用前文信息
- 是否避免重复询问或自相矛盾`,

  // promo 场景
  accuracy: `评估AI提供的活动规则和商品信息是否准确：
- 活动规则描述是否完整无遗漏
- 价格、折扣、赠品信息是否正确
- 是否避免编造不存在的活动或优惠`,

  clarity: `评估AI回复的表达是否清晰易懂：
- 复杂活动规则是否用简洁语言解释
- 是否使用分点或结构化表达
- 信息密度是否适中，不过度冗长`,

  crossRef: `评估AI是否正确关联相关活动信息：
- 是否主动关联其他相关优惠
- 交叉推荐是否合理
- 是否避免信息混淆`,

  format: `评估AI回复的格式和结构：
- 是否使用适当的分段和列表
- 关键信息是否突出
- 整体排版是否易于阅读`,

  // service 场景
  empathy: `评估AI对用户情绪的感知和共情能力：
- 是否识别用户的不满、焦虑、愤怒等情绪
- 是否先共情再解决问题
- 语气是否真诚温暖而非敷衍`,

  resolution: `评估AI提供的解决方案是否有效：
- 是否给出具体可执行的解决步骤
- 是否提供退换货等实际补救方案
- 是否主动跟进确认问题是否解决`,

  boundary: `评估AI在售后场景中的边界把控：
- 是否避免做出超出权限的承诺
- 是否合理引导超出范围的请求
- 是否在必要时建议联系人工客服`,

  // chat 场景
  emotion: `评估AI对用户情绪的感知和回应：
- 是否敏锐捕捉用户的情绪变化
- 回应的情感强度是否匹配
- 是否避免过度热情或过度冷淡`,

  naturalness: `评估对话的自然度和流畅性：
- 话题过渡是否自然
- 是否避免机械化的重复句式
- 回复长度是否适中`,

  profileUse: `评估AI是否根据用户画像调整沟通策略：
- 是否根据用户的年龄、偏好调整语气
- 是否运用已知的用户信息
- 是否区分不同用户群体的表达方式`,

  satisfaction: `评估用户对AI回复的满意度：
- 回复是否有帮助性和价值
- 是否让用户感到被关注和重视
- 对话体验是否愉快`,

  factual: `评估AI回复中是否存在事实错误：
- 是否提及了不存在的产品
- 是否编造了产品成分或功效
- 引用的信息是否准确可靠`,

  // hybrid 场景
  quality: `评估AI回复的整体质量：
- 回复是否结构清晰、逻辑通顺
- 信息密度是否适中
- 是否完整回答了用户的问题`,
}

/**
 * 为指定场景和维度生成评测 Prompt
 */
export function getPromptForDimension(
  sceneType: SceneType,
  dimensionKey: string,
  conversation: string,
  metrics?: string,
): string {
  // 优先使用已有的基础 Prompt
  if (BASE_PROMPTS[dimensionKey]) {
    let prompt = BASE_PROMPTS[dimensionKey].replace('{conversation}', conversation)
    if (dimensionKey === 'performance' && metrics) {
      prompt = prompt.replace('{metrics}', metrics)
    }
    return prompt
  }

  // 获取场景配置
  const sceneConfig = SCENE_CONFIGS[sceneType]
  const dimConfig = sceneConfig?.dimensions.find(d => d.key === dimensionKey)

  if (!dimConfig) {
    throw new Error(`Unknown dimension "${dimensionKey}" for scene "${sceneType}"`)
  }

  // 使用通用模板生成 Prompt
  return buildDimensionPrompt(sceneType, dimConfig, conversation)
}

/**
 * 构造通用维度评测 Prompt
 */
function buildDimensionPrompt(
  sceneType: SceneType,
  dim: DimensionConfig,
  conversation: string,
): string {
  const sceneContext = SCENE_CONTEXT[sceneType]
  const guide = DIMENSION_GUIDES[dim.key] || dim.description

  return `你是一位对话质量评估专家。请评估以下"AI 李佳琦"对话中的「${dim.label}」维度。

## 场景背景
${sceneContext}

## 评估维度：${dim.label}（满分 ${dim.maxScore} 分，权重 ${dim.weight}%）
${dim.description}

## 详细评估指南
${guide}

## 评分规则
- 9-10：该维度表现极为出色，几乎无可挑剔
- 7-8：表现良好，偶有小瑕疵但不影响整体
- 5-6：表现一般，有明显不足但基本合格
- 3-4：表现较差，多处不达标
- 1-2：表现极差，严重偏离标准

## 对话记录
${conversation}

## 输出格式
请严格按以下 JSON 格式输出：
\`\`\`json
{
  "score": <1-10 的数字>,
  "reasoning": "<1-2 句中文总结评分理由>",
  "details": {
    "strengths": ["<优点1>", "<优点2>"],
    "weaknesses": ["<不足1>", "<不足2>"],
    "examples": ["<具体对话举例>"]
  }
}
\`\`\``
}

/**
 * 获取场景的维度列表
 */
export function getSceneDimensions(sceneType: SceneType) {
  return SCENE_CONFIGS[sceneType]?.dimensions ?? SCENE_CONFIGS.hybrid.dimensions
}
