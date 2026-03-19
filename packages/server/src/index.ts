/**
 * Express 应用入口
 *
 * 路由规范：
 *   /eval/public/** — 无需鉴权
 *   /eval/api/**    — 需要 token 鉴权
 */
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

// ─── New modular route imports ─────────────────────────
import authRoutes from './modules/auth/routes'
import sessionRoutes from './modules/session/routes'
import evaluationRoutes from './modules/evaluation/routes'
import chatRoutes from './modules/chat/routes'
import knowledgeBaseRoutes from './modules/knowledge-base/routes'
import uploadRoutes from './modules/upload/routes'
import managementRoutes from './modules/management/routes'

// ─── Old route imports (kept for reference / backward compat) ───
// import authRoutes from './routes/auth'
// import sessionRoutes from './routes/sessions'
// import evaluationRoutes from './routes/evaluation'
// import mockRoutes from './routes/mock'
// import sseRoutes from './routes/sse'
// import configRoutes from './routes/config'
// import modelFilesRoutes from './routes/modelFiles'

// Config & LLM now use top-level copies
import { getConfig, updateConfig } from './config'
import { resetProviderCache } from './llm/providers'

import { authMiddleware } from './middleware/auth'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ─── Seed 内置用户（懒加载，首次请求时执行）──────────
let seeded = false
async function ensureSeed() {
  if (seeded) return
  try {
    const users = [
      { id: 1, username: 'admin', password: 'admin123' },
      { id: 2, username: 'test', password: 'test123' },
    ]
    for (const u of users) {
      const hash = crypto.createHash('sha256').update(u.password).digest('hex')
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: { id: u.id, username: u.username, passwordHash: hash },
      })
    }
    seeded = true
  } catch (err) {
    console.error('[eval-server] seed failed:', err)
  }
}

// 每次请求前确保 seed 完成
app.use(async (_req, _res, next) => {
  await ensureSeed()
  next()
})

// ─── Public 路由（无需鉴权）───────────────────────
app.use('/eval/public/v1/auth', authRoutes)

// ─── API 路由（需要鉴权）─────────────────────────
app.use('/eval/api/v1', authMiddleware)

// Modules
app.use('/eval/api/v1/sessions', sessionRoutes)
app.use('/eval/api/v1', evaluationRoutes)
app.use('/eval/api/v1/chat', chatRoutes)
app.use('/eval/api/v1/knowledge-base', knowledgeBaseRoutes)
app.use('/eval/api/v1/upload', uploadRoutes)
app.use('/eval/api/v1/management', managementRoutes)

// Config route (inline, uses top-level config module)
const configRouter = express.Router()
configRouter.get('/', (_req, res) => {
  const cfg = getConfig()
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
configRouter.put('/', (req, res) => {
  updateConfig(req.body)
  resetProviderCache()
  res.json({ code: 200, data: null })
})
app.use('/eval/api/v1/config', configRouter)

// Mock route (still uses old service, kept for backward compat)
import * as mockService from './services/mock'
const mockRouter = express.Router()
mockRouter.get('/presets', (_req, res) => {
  res.json({ code: 200, data: mockService.getPresets() })
})
mockRouter.post('/generate', async (req, res) => {
  try {
    const questions = await mockService.generateMockQuestions(req.body.messages || [])
    res.json({ code: 200, data: questions })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})
app.use('/eval/api/v1/mock', mockRouter)

// ─── Backward compat: keep old SSE path as alias ────────
// /eval/api/v1/sse/proxy → same handler as /eval/api/v1/chat/stream
import { proxySSE } from './modules/chat/services/proxy'
app.post('/eval/api/v1/sse/proxy', async (req, res) => {
  const { conversationId, messageType, content } = req.body
  if (!conversationId || !content) {
    return res.json({ code: 400, message: '缺少 conversationId 或 content' })
  }
  await proxySSE({ conversationId, messageType: messageType ?? 1, content }, req, res)
})

// ─── Backward compat: keep old model-files path as alias ──
app.use('/eval/api/v1/model-files', knowledgeBaseRoutes)

// ─── 仅在非 Vercel 环境下启动 HTTP server ────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[eval-server] running at http://localhost:${PORT}`)
  })
}

export default app
