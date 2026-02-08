<template>
  <aside class="w-[280px] flex-shrink-0 flex flex-col border-r border-[var(--md-outline-variant)] bg-[var(--md-surface-container)]">
    <!-- 顶部标题 + 新建按钮 -->
    <div class="p-4 border-b border-[var(--md-outline-variant)]">
      <h1 class="text-lg font-semibold text-[var(--md-on-surface)] mb-3">评测工具</h1>
      <button
        @click="handleCreate"
        class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition"
      >
        <Plus :size="18" />
        新建会话
      </button>
    </div>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-y-auto p-2">
      <div
        v-for="session in chatStore.sessions"
        :key="session.id"
        @click="handleSelect(session.id)"
        class="group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-colors"
        :class="session.id === chatStore.currentSessionId
          ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-surface)]'
          : 'hover:bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'"
      >
        <div class="flex items-center gap-2 min-w-0">
          <MessageSquare :size="16" class="flex-shrink-0" />
          <span class="truncate text-sm">{{ session.name }}</span>
        </div>
        <button
          @click.stop="handleDelete(session.id)"
          class="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--md-surface-container-highest)] transition"
        >
          <Trash2 :size="14" />
        </button>
      </div>

      <div v-if="chatStore.sessions.length === 0" class="text-center text-sm text-[var(--md-on-surface-variant)] py-8">
        暂无会话
      </div>
    </div>

    <!-- 底部用户信息 -->
    <div class="p-3 border-t border-[var(--md-outline-variant)] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)] flex items-center justify-center text-sm font-medium">
          {{ authStore.username?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <span class="text-sm text-[var(--md-on-surface)]">{{ authStore.username }}</span>
      </div>
      <button @click="handleLogout" class="p-2 rounded-lg hover:bg-[var(--md-surface-container-high)] transition">
        <LogOut :size="16" class="text-[var(--md-on-surface-variant)]" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, MessageSquare, Trash2, LogOut } from 'lucide-vue-next'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useEvaluationStore } from '@/stores/evaluationStore'

const chatStore = useChatStore()
const authStore = useAuthStore()
const evalStore = useEvaluationStore()
const router = useRouter()

onMounted(() => {
  chatStore.fetchSessions()
})

async function handleCreate() {
  await chatStore.createSession('新会话')
  evalStore.reset()
}

async function handleSelect(id: number) {
  await chatStore.selectSession(id)
  await evalStore.fetchEvaluations(id)
}

async function handleDelete(id: number) {
  if (!confirm('确定删除该会话？')) return
  await chatStore.removeSession(id)
  evalStore.reset()
}

function handleLogout() {
  authStore.clearAuth()
  router.replace('/login')
}
</script>
