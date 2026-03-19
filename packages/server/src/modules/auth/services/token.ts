/**
 * JWT Token 工具
 *
 * 生成和验证 access token / refresh token
 */
import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'eval-access-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'eval-refresh-secret'
const ACCESS_EXPIRES = '2h'
const REFRESH_EXPIRES = '7d'

export interface TokenPayload {
  userId: number
  username: string
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES })
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES })
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload
}

export function generateTokenPair(payload: TokenPayload) {
  return {
    token: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    userId: payload.userId,
  }
}
