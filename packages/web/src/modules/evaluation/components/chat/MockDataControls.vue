<template>
  <div class="flex items-center gap-2">
    <!-- 预设场景按钮 -->
    <button
      @click="showModal = true"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] hover:opacity-90 transition"
    >
      <BookOpen :size="14" />
      预设场景
    </button>

    <!-- AI 生成按钮 -->
    <button
      @click="handleAIGenerate"
      :disabled="generating"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--md-tertiary-container)] text-[var(--md-tertiary)] hover:opacity-90 disabled:opacity-50 transition"
    >
      <Wand2 :size="14" />
      {{ generating ? '生成中...' : 'AI 生成' }}
    </button>

    <!-- 两级预设弹窗 -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/25" @click="closeModal" />

        <!-- 第一级：文件夹列表 -->
        <div v-if="!selectedFolder" class="relative w-[580px] bg-[var(--md-surface-container-high)] rounded-[28px] p-7 shadow-xl" style="padding: 28px 32px;">
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-[var(--md-on-surface)]">选择用户Q数据库场景</h3>
              <p class="text-[13px] text-[var(--md-on-surface-variant)] mt-1.5">选择一个QA数据文件夹，浏览并选取测试用例</p>
            </div>
            <button @click="closeModal" class="w-9 h-9 rounded-full bg-[var(--md-surface-container)] flex items-center justify-center hover:opacity-80 transition">
              <X :size="18" class="text-[var(--md-on-surface-variant)]" />
            </button>
          </div>

          <!-- 文件夹列表 -->
          <div class="space-y-2 mb-6">
            <div
              v-for="folder in folders"
              :key="folder.key"
              @click="selectedFolder = folder"
              class="flex items-center gap-3 h-16 px-4 rounded-xl bg-[var(--md-surface-container)] cursor-pointer hover:bg-[var(--md-secondary-container)] transition"
            >
              <Folder :size="20" class="text-[var(--md-primary)] flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-[var(--md-on-surface)] truncate">{{ folder.folderName }}</div>
                <div class="text-xs text-[var(--md-on-surface-variant)]">{{ folder.description }} · {{ folder.files.length }} 个对话文件</div>
              </div>
              <span
                class="text-[11px] font-medium px-3 py-1 rounded-full flex-shrink-0"
                :style="{ backgroundColor: badgeColors[folder.sceneType]?.bg, color: badgeColors[folder.sceneType]?.text }"
              >
                {{ folder.sceneType }}
              </span>
              <ChevronRight :size="16" class="text-[var(--md-on-surface-variant)] flex-shrink-0" />
            </div>
          </div>

          <!-- 底部提示 -->
          <p class="text-[11px] text-[var(--md-on-surface-variant)] leading-relaxed">
            点击文件夹浏览QA用例，每个文件包含多轮对话及元数据（来源文档、品类、用户画像、主要诉求）
          </p>
        </div>

        <!-- 第二级：文件列表 -->
        <div v-else class="relative w-[620px] h-[520px] bg-[var(--md-surface-container-high)] rounded-[28px] shadow-xl flex flex-col" style="padding: 28px 32px;">
          <!-- 返回行 -->
          <div class="flex items-center gap-1 mb-4">
            <button @click="selectedFolder = null" class="flex items-center gap-1 text-xs font-medium text-[var(--md-primary)] hover:opacity-80 transition">
              <ArrowLeft :size="14" />
              返回文件夹列表
            </button>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full ml-1"
              :style="{ backgroundColor: badgeColors[selectedFolder.sceneType]?.bg, color: badgeColors[selectedFolder.sceneType]?.text }"
            >
              {{ selectedFolder.sceneType }}
            </span>
          </div>

          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-[var(--md-on-surface)]">{{ selectedFolder.folderName }}</h3>
              <p class="text-[13px] text-[var(--md-on-surface-variant)] mt-1">{{ selectedFolder.description }} · {{ selectedFolder.files.length }} 个对话文件</p>
            </div>
            <button @click="closeModal" class="w-9 h-9 rounded-full bg-[var(--md-surface-container)] flex items-center justify-center hover:opacity-80 transition">
              <X :size="18" class="text-[var(--md-on-surface-variant)]" />
            </button>
          </div>

          <!-- 文件列表（可滚动） -->
          <div class="flex-1 overflow-y-auto space-y-0.5 min-h-0">
            <div
              v-for="(file, index) in selectedFolder.files"
              :key="file.key"
              @click="selectFile(file)"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] cursor-pointer transition"
              :class="index === 0
                ? 'bg-[var(--md-primary-container)]'
                : 'hover:bg-[var(--md-surface-container)]'"
            >
              <FileText :size="16" :class="index === 0 ? 'text-[var(--md-primary)]' : 'text-[var(--md-on-surface-variant)]'" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-medium text-[var(--md-on-surface)] truncate">{{ file.name }}</div>
                <div class="text-[11px] text-[var(--md-on-surface-variant)] truncate">{{ file.description }} · {{ file.rounds }}轮</div>
              </div>
              <span v-if="file.category" class="text-[10px] font-medium text-[var(--md-on-surface-variant)] px-2 py-0.5 rounded-full bg-[var(--md-surface-container)] flex-shrink-0">
                {{ file.category }}
              </span>
            </div>
          </div>

          <!-- 底部计数 -->
          <div class="flex items-center justify-between pt-4 text-[11px] text-[var(--md-on-surface-variant)]">
            <span>共 {{ selectedFolder.files.length }} 个文件</span>
            <span v-if="selectedFolder.files.length > 6">↓ 滚动查看更多</span>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- AI 生成的问题选择弹窗 -->
    <Teleport to="body">
      <div v-if="showAIModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/25" @click="showAIModal = false" />
        <div class="relative w-[420px] bg-[var(--md-surface-container-high)] rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-[var(--md-on-surface)]">AI 生成的追问</h3>
            <button @click="showAIModal = false" class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-highest)] transition">
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-2">
            <button
              v-for="(q, i) in aiQuestions"
              :key="i"
              @click="selectAIQuestion(q)"
              class="w-full text-left p-3 rounded-xl bg-[var(--md-surface-container)] hover:bg-[var(--md-secondary-container)] text-sm text-[var(--md-on-surface)] transition"
            >
              {{ q }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BookOpen, Wand2, X, Folder, ChevronRight, ArrowLeft, FileText } from 'lucide-vue-next'
import { getPresets, generateMockQuestions } from '@/modules/evaluation/api/mock'
import { useChatStore } from '@/modules/evaluation/stores/chatStore'
import { useChat } from '@/modules/evaluation/composables/useChat'

interface PresetFile {
  key: string
  name: string
  description: string
  sceneType: string
  sceneLabel: string
  category: string
  rounds: number
  messages: string[]
}

interface FolderGroup {
  key: string
  folderName: string
  sceneType: string
  description: string
  files: PresetFile[]
}

const chatStore = useChatStore()
const chat = useChat()

const showModal = ref(false)
const showAIModal = ref(false)
const selectedFolder = ref<FolderGroup | null>(null)
const allPresets = ref<PresetFile[]>([])
const generating = ref(false)
const aiQuestions = ref<string[]>([])

// 文件夹名 → 显示信息映射
const FOLDER_META: Record<string, { folderName: string; description: string }> = {
  '护肤咨询': { folderName: '2025双十一_QA对话', description: '护肤咨询与商品推荐' },
  '大促规则': { folderName: '38小课堂_商品推荐&大促规则', description: '大促活动规则' },
  '日常闲聊(under35)': { folderName: '李佳琦闲聊QA对话_under35', description: '日常闲聊(<35用户)' },
  '日常闲聊(35+)': { folderName: '李佳琦闲聊QA对话_35plus', description: '日常闲聊(35+用户)' },
}

const badgeColors: Record<string, { bg: string; text: string }> = {
  consult: { bg: 'var(--md-primary-container)', text: 'var(--md-on-primary-container)' },
  promo: { bg: '#FEF9C3', text: '#B45309' },
  chat: { bg: '#DBEAFE', text: '#1D4ED8' },
  service: { bg: '#FEE2E2', text: '#DC2626' },
  hybrid: { bg: 'var(--md-surface-container)', text: 'var(--md-on-surface-variant)' },
}

// 按 sceneLabel 分组为文件夹
const folders = computed<FolderGroup[]>(() => {
  const groups: Record<string, PresetFile[]> = {}
  for (const p of allPresets.value) {
    const label = p.sceneLabel || 'other'
    if (!groups[label]) groups[label] = []
    groups[label].push(p)
  }

  return Object.entries(groups).map(([label, files]) => {
    const meta = FOLDER_META[label] || { folderName: label, description: label }
    return {
      key: label,
      folderName: meta.folderName,
      sceneType: files[0]?.sceneType || 'hybrid',
      description: meta.description,
      files,
    }
  })
})

onMounted(async () => {
  try {
    const res = await getPresets()
    allPresets.value = (res as any).data ?? res
  } catch {
    // 加载失败使用空列表
  }
})

function closeModal() {
  showModal.value = false
  selectedFolder.value = null
}

function selectFile(file: PresetFile) {
  closeModal()
  chat.startAutoSend(file.messages)
}

async function handleAIGenerate() {
  if (chatStore.messages.length === 0) return
  generating.value = true
  try {
    const msgs = chatStore.messages.map((m) => ({ role: m.role, content: m.content }))
    const res = await generateMockQuestions(msgs)
    aiQuestions.value = (res as any).data ?? res
    showAIModal.value = true
  } catch (err) {
    console.error('AI 生成失败:', err)
  } finally {
    generating.value = false
  }
}

function selectAIQuestion(question: string) {
  showAIModal.value = false
  chat.send(question)
}
</script>
