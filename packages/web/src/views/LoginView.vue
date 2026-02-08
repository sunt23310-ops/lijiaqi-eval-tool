<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--md-surface)]">
    <div class="w-[400px] p-8 rounded-3xl bg-[var(--md-surface-container)] shadow-lg">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--md-primary-container)] flex items-center justify-center">
          <Sparkles :size="32" class="text-[var(--md-primary)]" />
        </div>
        <h1 class="text-2xl font-bold text-[var(--md-on-surface)]">李佳琦模型评测</h1>
        <p class="text-sm text-[var(--md-on-surface-variant)] mt-1">内部评测工具</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--md-on-surface-variant)] mb-1.5">用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            class="w-full px-4 py-2.5 rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] text-[var(--md-on-surface)] text-sm focus:outline-none focus:border-[var(--md-primary)] transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--md-on-surface-variant)] mb-1.5">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="w-full px-4 py-2.5 rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] text-[var(--md-on-surface)] text-sm focus:outline-none focus:border-[var(--md-primary)] transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--md-on-surface-variant)] mb-1.5">验证码</label>
          <div class="flex gap-3">
            <input
              v-model="form.validCode"
              type="text"
              placeholder="请输入验证码"
              class="flex-1 px-4 py-2.5 rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] text-[var(--md-on-surface)] text-sm focus:outline-none focus:border-[var(--md-primary)] transition"
            />
            <div
              @click="refreshCaptcha"
              class="w-[120px] h-[42px] rounded-xl border border-[var(--md-outline-variant)] cursor-pointer overflow-hidden flex items-center justify-center bg-white"
              v-html="captchaImage"
            />
          </div>
        </div>

        <div v-if="errorMsg" class="text-sm text-[var(--md-error)]">{{ errorMsg }}</div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-2.5 rounded-xl bg-[var(--md-primary)] text-[var(--md-on-primary)] font-medium text-sm hover:opacity-90 disabled:opacity-50 transition"
        >
          {{ submitting ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="text-xs text-center text-[var(--md-on-surface-variant)] mt-6">
        测试账号：admin / admin123
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'
import { getValidCode, login } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  validCode: '',
})
const captchaImage = ref('')
const captchaHash = ref('')
const errorMsg = ref('')
const submitting = ref(false)

onMounted(() => {
  refreshCaptcha()
})

async function refreshCaptcha() {
  try {
    const res = await getValidCode()
    if (res.code === 200) {
      captchaImage.value = `<img src="${res.data.base64Image}" style="width:100%;height:100%;object-fit:contain" />`
      captchaHash.value = res.data.hash
    }
  } catch {
    captchaImage.value = '<span style="font-size:12px;color:#999">加载失败</span>'
  }
}

async function handleLogin() {
  if (!form.username || !form.password || !form.validCode) {
    errorMsg.value = '请填写所有字段'
    return
  }

  submitting.value = true
  errorMsg.value = ''

  try {
    const res = await login({
      username: form.username,
      password: form.password,
      validCode: form.validCode,
      hash: captchaHash.value,
    })

    if (res.code === 200) {
      authStore.setTokens(res.data.token, res.data.refreshToken)
      authStore.setUser(res.data.userId, form.username)
      router.replace('/')
    } else {
      errorMsg.value = res.message || '登录失败'
      refreshCaptcha()
    }
  } catch (err: any) {
    errorMsg.value = err.message || '登录失败'
    refreshCaptcha()
  } finally {
    submitting.value = false
  }
}
</script>
