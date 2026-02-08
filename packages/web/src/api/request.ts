/**
 * Axios 请求实例
 *
 * 请求拦截器：自动注入 token header
 * 响应拦截器：
 *   code 5102 → 自动刷新 token 并重试原请求
 *   code 5101 → 跳转登录页
 */
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAuthStore } from '../stores/authStore'
import router from '../router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
})

/** 是否正在刷新 token */
let isRefreshing = false
/** 等待 token 刷新的请求队列 */
let pendingRequests: Array<(token: string) => void> = []

// ─── 请求拦截器 ──────────────────────────────────
request.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.token = authStore.token
  }
  return config
})

// ─── 响应拦截器 ──────────────────────────────────
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code } = response.data

    // 正常响应
    if (code === 200) return response.data

    // 5102: token 过期，需刷新
    if (code === 5102) {
      return handleTokenRefresh(response.config)
    }

    // 5101: token 无效，需重新登录
    if (code === 5101) {
      handleForceLogout()
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    // 其他业务错误
    return Promise.reject(response.data)
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 处理 token 刷新
 * 多个请求同时 5102 时，只刷新一次，其余排队等待
 */
async function handleTokenRefresh(originalConfig: AxiosRequestConfig) {
  if (!isRefreshing) {
    isRefreshing = true
    const authStore = useAuthStore()

    try {
      // 直接用 axios 发请求，不走拦截器
      const { data } = await axios.post(
        `${request.defaults.baseURL}/eval/public/v1/auth/refresh`,
        { refreshToken: authStore.refreshToken }
      )

      if (data.code === 200) {
        authStore.setTokens(data.data.token, data.data.refreshToken)
        // 通知排队的请求用新 token 重试
        pendingRequests.forEach((resolve) => resolve(data.data.token))
        pendingRequests = []
        // 重试原请求
        originalConfig.headers!.token = data.data.token
        return request(originalConfig)
      } else {
        handleForceLogout()
        return Promise.reject(new Error('刷新 token 失败'))
      }
    } catch {
      handleForceLogout()
      return Promise.reject(new Error('刷新 token 失败'))
    } finally {
      isRefreshing = false
    }
  }

  // 正在刷新中，排队等待
  return new Promise((resolve) => {
    pendingRequests.push((newToken: string) => {
      originalConfig.headers!.token = newToken
      resolve(request(originalConfig))
    })
  })
}

function handleForceLogout() {
  const authStore = useAuthStore()
  authStore.clearAuth()
  router.replace('/login')
}

export default request
