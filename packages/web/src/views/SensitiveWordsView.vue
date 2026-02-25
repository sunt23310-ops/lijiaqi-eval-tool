<template>
  <div class="flex h-screen bg-[var(--md-surface)]">
    <!-- 左侧导航栏 -->
    <aside class="w-[280px] flex-shrink-0 flex flex-col border-r border-[var(--md-outline-variant)] bg-[var(--md-surface-container)]">
      <!-- 顶部标题 -->
      <div class="p-5 border-b border-[var(--md-outline-variant)]">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[var(--md-primary)] flex items-center justify-center">
            <Shield :size="18" class="text-[var(--md-on-primary)]" />
          </div>
          <div>
            <h1 class="text-sm font-semibold text-[var(--md-on-surface)]">AI 李佳琦</h1>
            <p class="text-xs text-[var(--md-on-surface-variant)]">评测管理平台</p>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-5">
        <!-- 主要功能 -->
        <div>
          <p class="text-xs font-medium text-[var(--md-on-surface-variant)] px-3 mb-1.5 uppercase tracking-wide">主要功能</p>
          <div class="space-y-0.5">
            <RouterLink
              to="/"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition-colors"
            >
              <MessageSquare :size="16" class="flex-shrink-0" />
              新建会话
            </RouterLink>
            <RouterLink
              to="/"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition-colors"
            >
              <History :size="16" class="flex-shrink-0" />
              评测历史
            </RouterLink>
            <RouterLink
              to="/"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition-colors"
            >
              <BarChart3 :size="16" class="flex-shrink-0" />
              评测结果
            </RouterLink>
          </div>
        </div>

        <!-- 系统管理 -->
        <div>
          <p class="text-xs font-medium text-[var(--md-on-surface-variant)] px-3 mb-1.5 uppercase tracking-wide">系统管理</p>
          <div class="space-y-0.5">
            <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-[var(--md-secondary-container)] text-[var(--md-on-surface)] cursor-default"
            >
              <ShieldAlert :size="16" class="flex-shrink-0 text-[var(--md-primary)]" />
              敏感词管理
            </div>
          </div>
        </div>
      </nav>

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

    <!-- 右侧主内容 -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- 页面标题栏 -->
      <div class="px-6 py-5 border-b border-[var(--md-outline-variant)] bg-white flex items-center gap-3 flex-shrink-0">
        <ShieldAlert :size="20" class="text-[var(--md-primary)]" />
        <h2 class="text-base font-semibold text-[var(--md-on-surface)]">敏感词管理</h2>
        <span class="text-sm text-[var(--md-on-surface-variant)]">李佳琦大模型</span>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white rounded-2xl p-4 border border-[var(--md-outline-variant)]"
          >
            <p class="text-sm text-[var(--md-on-surface-variant)] mb-1">{{ stat.label }}</p>
            <p class="text-2xl font-bold" :class="stat.color">{{ stat.value }}</p>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="bg-white rounded-2xl border border-[var(--md-outline-variant)] overflow-hidden">
          <!-- 第一行：搜索 + 添加 -->
          <div class="px-6 py-3.5 flex items-center justify-between border-b border-[var(--md-outline-variant)]">
            <div class="flex items-center gap-2 w-[300px] h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] bg-[#F8FAFC]">
              <Search :size="16" class="text-[#94A3B8] flex-shrink-0" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索敏感词..."
                class="flex-1 bg-transparent text-sm text-[var(--md-on-surface)] placeholder:text-[#94A3B8] outline-none"
              />
            </div>
            <button
              @click="showAddModal = true"
              class="flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition"
            >
              <Plus :size="16" />
              添加敏感词
            </button>
          </div>

          <!-- 第二行：筛选 -->
          <div class="px-6 py-2.5 flex items-center justify-between">
            <!-- 分类分段控件 -->
            <div class="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-[3px]">
              <button
                v-for="tab in categoryTabs"
                :key="tab.value"
                @click="activeCategory = tab.value"
                class="px-3.5 py-1.5 rounded-md text-xs font-medium transition-all"
                :class="activeCategory === tab.value
                  ? 'bg-white text-[var(--md-primary)] shadow-sm'
                  : 'text-[#64748B] hover:text-[var(--md-on-surface)]'"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- 状态筛选 chip -->
            <div class="flex items-center gap-2">
              <button
                v-for="chip in statusChips"
                :key="chip.value"
                @click="activeStatus = activeStatus === chip.value ? '' : chip.value"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                :class="activeStatus === chip.value ? chip.activeClass : chip.inactiveClass"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="chip.dotClass"></span>
                {{ chip.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 敏感词列表 -->
        <div class="space-y-3">
          <div
            v-for="word in filteredWords"
            :key="word.id"
            class="bg-white rounded-2xl border border-[var(--md-outline-variant)] px-6 py-4 flex items-center justify-between hover:border-[var(--md-outline)] transition-colors"
          >
            <!-- 左侧信息 -->
            <div class="flex flex-col gap-2 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-[var(--md-on-surface)]">{{ word.name }}</span>
                <span
                  class="px-2 py-0.5 rounded-md text-xs font-medium"
                  :class="categoryBadgeClass(word.category)"
                >{{ word.category }}</span>
                <span
                  class="px-2 py-0.5 rounded-md text-xs font-medium"
                  :class="riskBadgeClass(word.risk)"
                >{{ word.risk }}</span>
                <span class="flex items-center gap-1 text-xs" :class="word.status === '已上线' ? 'text-green-600' : 'text-[#94A3B8]'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="word.status === '已上线' ? 'bg-green-500' : 'bg-[#94A3B8]'"></span>
                  {{ word.status }}
                </span>
              </div>
              <p class="text-xs text-[var(--md-on-surface-variant)]">
                上线时间: {{ word.onlineTime }}
              </p>
            </div>

            <!-- 右侧操作 -->
            <div class="flex items-center gap-2 flex-shrink-0 ml-6">
              <!-- 已上线：仅显示下线按钮 -->
              <template v-if="word.status === '已上线'">
                <button
                  @click="handleOffline(word.id)"
                  class="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-normal transition hover:opacity-80"
                  style="background-color: #FEF3C7; color: #92400E;"
                >
                  <ToggleLeft :size="14" />
                  下线
                </button>
              </template>

              <!-- 未上线：显示删除 + 上线按钮 -->
              <template v-else>
                <button
                  @click="handleDelete(word.id)"
                  class="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-normal transition hover:opacity-80"
                  style="background-color: #FEE2E2; color: #991B1B;"
                >
                  <Trash2 :size="14" />
                  删除
                </button>
                <button
                  @click="handleOnline(word.id)"
                  class="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-normal transition hover:opacity-80"
                  style="background-color: #D1FAE5; color: #065F46;"
                >
                  <ToggleRight :size="14" />
                  上线
                </button>
              </template>
            </div>
          </div>

          <div v-if="filteredWords.length === 0" class="text-center py-16 text-sm text-[var(--md-on-surface-variant)]">
            暂无匹配的敏感词
          </div>
        </div>
      </div>
    </main>

    <!-- 添加弹窗 -->
    <AddSensitiveWordModal
      v-model="showAddModal"
      @confirm="handleAddWord"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Shield, ShieldAlert, MessageSquare, History, BarChart3,
  LogOut, Search, Plus, ToggleLeft, ToggleRight, Trash2,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import AddSensitiveWordModal from '@/components/sensitive-words/AddSensitiveWordModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// ── 状态 ──────────────────────────────────────────────
const showAddModal = ref(false)
const searchQuery = ref('')
const activeCategory = ref('全部')
const activeStatus = ref('')

// ── Mock 数据 ─────────────────────────────────────────
interface SensitiveWord {
  id: number
  name: string
  category: string
  risk: string
  status: '已上线' | '未上线'
  onlineTime: string
}

const words = ref<SensitiveWord[]>([
  { id: 1, name: '某奢侈品牌', category: '违禁词',  risk: '高风险', status: '已上线', onlineTime: '2025-01-15 14:30' },
  { id: 2, name: '刷单',       category: '违禁词',  risk: '高风险', status: '已上线', onlineTime: '2025-01-10 09:12' },
  { id: 3, name: '私下购买',   category: '敏感话题', risk: '中风险', status: '已上线', onlineTime: '2025-01-08 16:45' },
  { id: 4, name: '价格战营销', category: '竞品词',  risk: '低风险', status: '已上线', onlineTime: '2025-01-20 11:00' },
  { id: 5, name: '假冒正品',   category: '违禁词',  risk: '高风险', status: '未上线', onlineTime: '--' },
])

// ── 统计 ──────────────────────────────────────────────
const stats = computed(() => [
  { label: '总词数',   value: words.value.length,                                      color: 'text-[var(--md-on-surface)]' },
  { label: '已上线',   value: words.value.filter(w => w.status === '已上线').length,   color: 'text-green-600' },
  { label: '未上线',   value: words.value.filter(w => w.status === '未上线').length,   color: 'text-[#94A3B8]' },
  { label: '今日新增', value: 1,                                                        color: 'text-[var(--md-primary)]' },
])

// ── 筛选 Tabs ─────────────────────────────────────────
const categoryTabs = [
  { label: '全部',   value: '全部' },
  { label: '违禁词', value: '违禁词' },
  { label: '竞品词', value: '竞品词' },
  { label: '敏感话题', value: '敏感话题' },
]

const statusChips = [
  {
    label: '已上线', value: '已上线',
    dotClass: 'bg-green-500',
    activeClass:   'bg-green-100 text-green-700',
    inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-green-50 hover:text-green-600',
  },
  {
    label: '未上线', value: '未上线',
    dotClass: 'bg-[#94A3B8]',
    activeClass:   'bg-slate-200 text-slate-600',
    inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-slate-200',
  },
]

// ── 过滤后列表 ────────────────────────────────────────
const filteredWords = computed(() => {
  return words.value.filter(w => {
    const matchSearch   = !searchQuery.value || w.name.includes(searchQuery.value)
    const matchCategory = activeCategory.value === '全部' || w.category === activeCategory.value
    const matchStatus   = !activeStatus.value || w.status === activeStatus.value
    return matchSearch && matchCategory && matchStatus
  })
})

// ── 徽章样式 ──────────────────────────────────────────
function categoryBadgeClass(category: string) {
  const map: Record<string, string> = {
    '违禁词':  'bg-red-100 text-red-700',
    '竞品词':  'bg-blue-100 text-blue-700',
    '敏感话题': 'bg-orange-100 text-orange-700',
    '其他':    'bg-slate-100 text-slate-600',
  }
  return map[category] ?? 'bg-slate-100 text-slate-600'
}

function riskBadgeClass(risk: string) {
  const map: Record<string, string> = {
    '高风险': 'bg-red-100 text-red-700',
    '中风险': 'bg-amber-100 text-amber-700',
    '低风险': 'bg-green-100 text-green-700',
  }
  return map[risk] ?? 'bg-slate-100 text-slate-600'
}

// ── 操作 ──────────────────────────────────────────────
function handleOffline(id: number) {
  const word = words.value.find(w => w.id === id)
  if (word) {
    word.status = '未上线'
    word.onlineTime = '--'
  }
}

function handleOnline(id: number) {
  const word = words.value.find(w => w.id === id)
  if (word) {
    word.status = '已上线'
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    word.onlineTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
}

function handleDelete(id: number) {
  if (!confirm('确认删除该敏感词？')) return
  words.value = words.value.filter(w => w.id !== id)
}

function handleAddWord(data: { name: string; category: string; risk: string; remark: string }) {
  words.value.push({
    id: Date.now(),
    name: data.name,
    category: data.category,
    risk: data.risk,
    status: '未上线',
    onlineTime: '--',
  })
  showAddModal.value = false
}

function handleLogout() {
  authStore.clearAuth()
  router.replace('/login')
}
</script>
