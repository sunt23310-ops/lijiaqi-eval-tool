/**
 * 认证状态管理
 *
 * token / refreshToken 持久化到 localStorage
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const userId = ref<number | null>(
    localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
  )
  const username = ref(localStorage.getItem('username') || '')

  const isLoggedIn = computed(() => !!token.value)

  function setTokens(newToken: string, newRefreshToken: string) {
    token.value = newToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('token', newToken)
    localStorage.setItem('refreshToken', newRefreshToken)
  }

  function setUser(id: number, name: string) {
    userId.value = id
    username.value = name
    localStorage.setItem('userId', String(id))
    localStorage.setItem('username', name)
  }

  function clearAuth() {
    token.value = ''
    refreshToken.value = ''
    userId.value = null
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
  }

  return {
    token,
    refreshToken,
    userId,
    username,
    isLoggedIn,
    setTokens,
    setUser,
    clearAuth,
  }
})
