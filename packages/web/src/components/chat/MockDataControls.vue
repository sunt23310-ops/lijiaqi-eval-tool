<template>
  <div class="flex items-center gap-2">
    <!-- 预设场景按钮 -->
    <button
      @click="showPresetModal = true"
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

    <!-- 预设场景弹窗 -->
    <Teleport to="body">
      <div v-if="showPresetModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/25" @click="showPresetModal = false" />
        <div class="relative w-[480px] bg-[var(--md-surface-container-high)] rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-[var(--md-on-surface)]">选择预设测试场景</h3>
            <button @click="showPresetModal = false" class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-highest)] transition">
              <X :size="18" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="preset in presets"
              :key="preset.key"
              @click="selectPreset(preset)"
              class="p-4 rounded-2xl bg-[var(--md-surface-container)] hover:bg-[var(--md-secondary-container)] cursor-pointer transition group"
            >
              <div class="text-2xl mb-2">{{ preset.emoji }}</div>
              <div class="text-sm font-medium text-[var(--md-on-surface)] mb-1">{{ preset.name }}</div>
              <div class="text-xs text-[var(--md-on-surface-variant)] mb-2 line-clamp-2">{{ preset.description }}</div>
              <span class="text-xs px-2 py-0.5 rounded-full bg-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)]">
                {{ preset.rounds }} 轮对话
              </span>
            </div>
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
import { ref, onMounted } from 'vue'
import { BookOpen, Wand2, X } from 'lucide-vue-next'
import { getPresets, generateMockQuestions, type PresetScenario } from '@/api/mock'
import { useChatStore } from '@/stores/chatStore'
import { useChat } from '@/composables/useChat'

const chatStore = useChatStore()
const chat = useChat()

const showPresetModal = ref(false)
const showAIModal = ref(false)
const presets = ref<PresetScenario[]>([])
const generating = ref(false)
const aiQuestions = ref<string[]>([])

onMounted(async () => {
  try {
    const res = await getPresets()
    presets.value = (res as any).data ?? res
  } catch {
    // 加载失败使用空列表
  }
})

function selectPreset(preset: PresetScenario) {
  showPresetModal.value = false
  chat.startAutoSend(preset.messages)
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
