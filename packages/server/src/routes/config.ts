/**
 * 配置路由
 */
import { Router } from 'express'
import { getConfig, updateConfig } from '../services/config'
import { resetProviderCache } from '../services/llm/providers'

const router = Router()

router.get('/', (_req, res) => {
  const cfg = getConfig()
  // 隐藏敏感信息，只返回掩码
  res.json({
    code: 200,
    data: {
      sseApiBaseUrl: cfg.sseApiBaseUrl,
      llmProvider: cfg.llmProvider,
      openaiModel: cfg.openaiModel,
      anthropicModel: cfg.anthropicModel,
      hasOpenaiKey: !!cfg.openaiApiKey,
      hasAnthropicKey: !!cfg.anthropicApiKey,
      hasSseToken: !!cfg.sseApiToken,
    },
  })
})

router.put('/', (req, res) => {
  updateConfig(req.body)
  resetProviderCache()
  res.json({ code: 200, data: null })
})

export default router
