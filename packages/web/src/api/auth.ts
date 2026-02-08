/**
 * 登录鉴权 API
 */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 获取图片验证码
 * GET /eval/public/v1/auth/validCode
 */
export function getValidCode() {
  return axios
    .get<{
      code: number
      data: { base64Image: string; hash: string }
    }>(`${baseURL}/eval/public/v1/auth/validCode`)
    .then((res) => res.data)
}

/**
 * 登录
 * POST /eval/public/v1/auth/login
 */
export function login(params: {
  username: string
  password: string
  validCode: string
  hash: string
}) {
  return axios
    .post<{
      code: number
      message?: string
      data: { token: string; refreshToken: string; userId: number }
    }>(`${baseURL}/eval/public/v1/auth/login`, params)
    .then((res) => res.data)
}

/**
 * 刷新 token
 * POST /eval/public/v1/auth/refresh
 */
export function refreshToken(refreshToken: string) {
  return axios
    .post<{
      code: number
      data: { token: string; refreshToken: string; userId: number }
    }>(`${baseURL}/eval/public/v1/auth/refresh`, { refreshToken })
    .then((res) => res.data)
}
