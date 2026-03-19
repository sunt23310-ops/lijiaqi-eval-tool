/**
 * 内容审核服务 (stub)
 *
 * 对 AI 生成内容进行合规审核。
 * 后续可接入第三方内容审核 API（如阿里云内容安全、腾讯天御等）。
 */

export type ReviewStatus = 'pass' | 'block' | 'review'

export interface ReviewResult {
  status: ReviewStatus
  /** 触发的规则 */
  triggeredRules: string[]
  /** 审核详情 */
  details: Record<string, any>
  /** 审核耗时 (ms) */
  latencyMs: number
}

export interface ReviewOptions {
  /** 是否启用第三方审核 */
  enableThirdParty?: boolean
  /** 审核场景标识 */
  scene?: string
}

/**
 * 审核文本内容
 *
 * 当前为本地规则匹配，后续可扩展为：
 * 1. 本地敏感词检查
 * 2. 第三方 API 审核
 * 3. LLM 内容安全评估
 */
export async function reviewContent(
  content: string,
  _options?: ReviewOptions
): Promise<ReviewResult> {
  const startTime = Date.now()

  // TODO: 接入敏感词服务
  // TODO: 接入第三方审核 API

  // 目前仅返回通过
  return {
    status: 'pass',
    triggeredRules: [],
    details: {},
    latencyMs: Date.now() - startTime,
  }
}

/**
 * 批量审核
 */
export async function reviewBatch(
  contents: string[],
  options?: ReviewOptions
): Promise<ReviewResult[]> {
  return Promise.all(contents.map((c) => reviewContent(c, options)))
}
