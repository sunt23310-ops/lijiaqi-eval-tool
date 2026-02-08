/**
 * Express 应用入口
 *
 * 路由规范：
 *   /eval/public/** — 无需鉴权
 *   /eval/api/**    — 需要 token 鉴权
 */
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import sessionRoutes from './routes/sessions'
import evaluationRoutes from './routes/evaluation'
import mockRoutes from './routes/mock'
import sseRoutes from './routes/sse'
import configRoutes from './routes/config'
import { authMiddleware } from './middleware/auth'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ─── Public 路由（无需鉴权）───────────────────────
app.use('/eval/public/v1/auth', authRoutes)

// ─── API 路由（需要鉴权）─────────────────────────
app.use('/eval/api/v1', authMiddleware)
app.use('/eval/api/v1/sessions', sessionRoutes)
app.use('/eval/api/v1', evaluationRoutes) // 评测路由内含 /sessions/:id/evaluate 和 /evaluations/:id
app.use('/eval/api/v1/mock', mockRoutes)
app.use('/eval/api/v1/sse', sseRoutes)
app.use('/eval/api/v1/config', configRoutes)

app.listen(PORT, () => {
  console.log(`[eval-server] running at http://localhost:${PORT}`)
})

export default app
