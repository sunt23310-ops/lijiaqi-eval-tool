<template>
  <aside class="w-[280px] flex-shrink-0 flex flex-col border-r border-[var(--md-outline-variant)] bg-[var(--md-surface-container)]">
    <!-- 顶部标题 + 新建按钮 -->
    <div class="p-4 border-b border-[var(--md-outline-variant)]">
      <h1 class="text-lg font-semibold text-[var(--md-on-surface)] mb-3">评测工具</h1>
      <button
        @click="showNewSessionModal = true"
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
          <span class="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)]">
            {{ getSceneLabel(session.sceneType) }}
          </span>
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

    <!-- 系统管理 -->
    <div class="px-2 pb-2 border-t border-[var(--md-outline-variant)]">
      <p class="text-xs font-medium text-[var(--md-on-surface-variant)] px-3 pt-3 pb-1.5 uppercase tracking-wide">系统管理</p>
      <RouterLink
        to="/management/sensitive-words"
        class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
        :class="$route.path === '/management/sensitive-words'
          ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-surface)] font-medium'
          : 'text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)]'"
      >
        <ShieldAlert :size="16" class="flex-shrink-0" />
        敏感词管理
      </RouterLink>
      <RouterLink
        to="/management/knowledge-base"
        class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
        :class="$route.path === '/management/knowledge-base'
          ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-surface)] font-medium'
          : 'text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)]'"
      >
        <Database :size="16" class="flex-shrink-0" />
        商品知识库
      </RouterLink>
      <RouterLink
        to="/management/content-review"
        class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
        :class="$route.path === '/management/content-review'
          ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-surface)] font-medium'
          : 'text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)]'"
      >
        <ScanSearch :size="16" class="flex-shrink-0" />
        算法内容审核
      </RouterLink>
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

  <!-- 新建会话弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showNewSessionModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" @click="showNewSessionModal = false" />
        <div class="relative w-[440px] bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-base font-semibold text-[var(--md-on-surface)] mb-4">新建会话</h3>

          <!-- 会话名称 -->
          <div class="mb-4">
            <label class="text-sm font-medium text-[var(--md-on-surface)] mb-1.5 block">会话名称</label>
            <input
              v-model="newSessionName"
              type="text"
              placeholder="新会话"
              class="w-full px-3 py-2 rounded-lg border border-[var(--md-outline-variant)] text-sm outline-none focus:border-[var(--md-primary)] transition"
            />
          </div>

          <!-- 场景选择 -->
          <div class="mb-5">
            <label class="text-sm font-medium text-[var(--md-on-surface)] mb-2 block">评测场景</label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="scene in sceneOptions"
                :key="scene.type"
                @click="selectedScene = scene.type"
                class="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all"
                :class="selectedScene === scene.type
                  ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)]'
                  : 'border-[var(--md-outline-variant)] hover:border-[var(--md-outline)]'"
              >
                <span class="text-lg">{{ scene.emoji }}</span>
                <span class="text-[10px] font-medium" :class="selectedScene === scene.type ? 'text-[var(--md-primary)]' : 'text-[var(--md-on-surface-variant)]'">
                  {{ scene.label }}
                </span>
              </button>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="flex justify-end gap-2">
            <button
              @click="showNewSessionModal = false"
              class="px-4 py-2 rounded-lg text-sm text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)] transition"
            >
              取消
            </button>
            <button
              @click="handleCreate"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--md-primary)] text-[var(--md-on-primary)] hover:opacity-90 transition"
            >
              创建
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, MessageSquare, Trash2, LogOut, ShieldAlert, Database, ScanSearch } from 'lucide-vue-next'
import type { SceneType } from '@eval/shared'
import { SCENE_CONFIGS } from '@eval/shared'
import { useChatStore } from '@/modules/evaluation/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useEvaluationStore } from '@/modules/evaluation/stores/evaluationStore'

const chatStore = useChatStore()
const authStore = useAuthStore()
const evalStore = useEvaluationStore()
const router = useRouter()
const route = useRoute()

const showNewSessionModal = ref(false)
const newSessionName = ref('')
const selectedScene = ref<SceneType>('hybrid')

const SCENE_EMOJIS: Record<SceneType, string> = {
  consult: '🧴',
  promo: '🎉',
  service: '🔧',
  chat: '💬',
  hybrid: '🔄',
}

const sceneOptions = Object.values(SCENE_CONFIGS).map(s => ({
  type: s.type,
  label: s.label,
  emoji: SCENE_EMOJIS[s.type] || '📋',
}))

function getSceneLabel(sceneType?: string): string {
  if (!sceneType) return '混合'
  return SCENE_CONFIGS[sceneType as SceneType]?.label || '混合'
}

onMounted(() => {
  chatStore.fetchSessions()
})

async function handleCreate() {
  const name = newSessionName.value.trim() || '新会话'
  await chatStore.createSession(name, selectedScene.value)
  evalStore.reset()
  showNewSessionModal.value = false
  newSessionName.value = ''
  selectedScene.value = 'hybrid'
  if (route.name !== 'Workspace') router.push('/')
}

async function handleSelect(id: number) {
  await chatStore.selectSession(id)
  await evalStore.fetchEvaluations(id)
  if (route.name !== 'Workspace') router.push('/')
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

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
