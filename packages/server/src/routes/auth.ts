/**
 * 认证路由（public — 无需鉴权）
 *
 * GET  /eval/public/v1/auth/validCode — 获取图片验证码
 * POST /eval/public/v1/auth/login     — 登录
 * POST /eval/public/v1/auth/refresh   — 刷新 token
 */
import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import { createCaptcha, verifyCaptcha } from '../services/auth/captcha'
import { generateTokenPair, verifyRefreshToken } from '../services/auth/token'

const router = Router()

/** 内置用户（后续可接数据库） */
const USERS = [
  { userId: 1, username: 'admin', passwordHash: hashPassword('admin123') },
  { userId: 2, username: 'test', passwordHash: hashPassword('test123') },
]

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * GET /eval/public/v1/auth/validCode
 * 获取图片验证码
 */
router.get('/validCode', (_req: Request, res: Response) => {
  const captcha = createCaptcha()
  res.json({
    code: 200,
    data: {
      base64Image: captcha.base64Image,
      hash: captcha.hash,
    },
  })
})

/**
 * POST /eval/public/v1/auth/login
 * 登录
 * Body: { username, password, validCode, hash }
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, password, validCode, hash } = req.body

  if (!username || !password || !validCode || !hash) {
    return res.json({ code: 400, message: '缺少必填字段' })
  }

  // 1. 验证图片验证码
  if (!verifyCaptcha(hash, validCode)) {
    return res.json({ code: 400, message: '验证码错误或已过期' })
  }

  // 2. 验证用户名密码
  const user = USERS.find(
    (u) => u.username === username && u.passwordHash === hashPassword(password)
  )

  if (!user) {
    return res.json({ code: 401, message: '用户名或密码错误' })
  }

  // 3. 生成 token 对
  const tokens = generateTokenPair({ userId: user.userId, username: user.username })

  res.json({
    code: 200,
    data: tokens,
  })
})

/**
 * POST /eval/public/v1/auth/refresh
 * 刷新 token
 * Body: { refreshToken }
 */
router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.json({ code: 5101, message: '缺少 refreshToken' })
  }

  try {
    const payload = verifyRefreshToken(refreshToken)
    const tokens = generateTokenPair({ userId: payload.userId, username: payload.username })
    res.json({
      code: 200,
      data: tokens,
    })
  } catch {
    return res.json({ code: 5101, message: 'refreshToken 无效或已过期，请重新登录' })
  }
})

export default router
