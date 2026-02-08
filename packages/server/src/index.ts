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
import authRoutes from './routes/auth'
import sessionRoutes from './routes/sessions'
import evaluationRoutes from './routes/evaluation'
import mockRoutes from './routes/mock'
import sseRoutes from './routes/sse'
import configRoutes from './routes/config'
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
app.use('/eval/api/v1/sessions', sessionRoutes)
app.use('/eval/api/v1', evaluationRoutes)
app.use('/eval/api/v1/mock', mockRoutes)
app.use('/eval/api/v1/sse', sseRoutes)
app.use('/eval/api/v1/config', configRoutes)

// ─── 仅在非 Vercel 环境下启动 HTTP server ────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[eval-server] running at http://localhost:${PORT}`)
  })
}

export default app
