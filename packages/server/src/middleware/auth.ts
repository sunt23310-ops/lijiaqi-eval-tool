/**
 * Token 鉴权中间件
 *
 * 路由命名规范：
 *   /eval/public/** — 无需鉴权（登录、验证码、刷新 token）
 *   /eval/api/**    — 需要 token 鉴权
 *
 * 错误码：
 *   5101 — token 无效或已过期，需重新登录
 *   5102 — token 即将过期可刷新（由前端拦截器处理）
 */
import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type TokenPayload } from '../services/auth/token'

// 扩展 Express Request，注入用户信息
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.token as string | undefined

  if (!token) {
    return res.json({ code: 5101, message: '未提供 token，请先登录' })
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      // token 过期 → 前端应调用 refresh 接口
      return res.json({ code: 5102, message: 'token 已过期，请刷新' })
    }
    return res.json({ code: 5101, message: 'token 无效，请重新登录' })
  }
}
