<template>
  <aside class="w-[420px] flex-shrink-0 flex flex-col border-l border-[var(--md-outline-variant)] bg-[var(--md-surface-container)]">
    <!-- 顶部 -->
    <div class="h-14 flex items-center justify-between px-5 border-b border-[var(--md-outline-variant)]">
      <h2 class="text-base font-medium text-[var(--md-on-surface)]">模型评测</h2>
      <button
        v-if="chatStore.currentSessionId"
        @click="handleEvaluate"
        :disabled="evalStore.isEvaluating || chatStore.messages.length < 2"
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--md-primary)] text-[var(--md-on-primary)] hover:opacity-90 disabled:opacity-40 transition"
      >
        <Zap :size="14" />
        {{ evalStore.isEvaluating ? '评测中...' : '评测模型结果' }}
      </button>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-y-auto p-5">
      <template v-if="!chatStore.currentSessionId">
        <div class="flex flex-col items-center justify-center h-full text-[var(--md-on-surface-variant)]">
          <BarChart3 :size="48" class="mb-4 opacity-30" />
          <p class="text-sm">选择会话后可进行评测</p>
        </div>
      </template>

      <template v-else-if="evalStore.evaluations.length === 0 && !evalStore.isEvaluating">
        <div class="flex flex-col items-center justify-center h-full text-[var(--md-on-surface-variant)]">
          <BarChart3 :size="48" class="mb-4 opacity-30" />
          <p class="text-sm text-center">点击「评测模型结果」<br/>开始评测当前对话</p>
        </div>
      </template>

      <template v-else-if="evalStore.isEvaluating">
        <div class="flex flex-col items-center justify-center h-full">
          <div class="w-10 h-10 border-3 border-[var(--md-primary)] border-t-transparent rounded-full animate-spin mb-4" />
          <p class="text-sm text-[var(--md-on-surface-variant)]">正在评测中，请稍候...</p>
          <p class="text-xs text-[var(--md-on-surface-variant)] mt-1">5 个维度并行评测</p>
        </div>
      </template>

      <!-- 历史列表视图 -->
      <template v-else-if="evalStore.viewMode === 'history'">
        <EvalHistoryList />
      </template>

      <!-- 详情视图 -->
      <template v-else-if="evalStore.viewMode === 'detail' && evalStore.currentEvaluation">
        <ReportDetail />
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Zap, BarChart3 } from 'lucide-vue-next'
import { useChatStore } from '@/stores/chatStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { useEvaluation } from '@/composables/useEvaluation'
import EvalHistoryList from './EvalHistoryList.vue'
import ReportDetail from './ReportDetail.vue'

const chatStore = useChatStore()
const evalStore = useEvaluationStore()
const { evaluate } = useEvaluation()

async function handleEvaluate() {
  try {
    await evaluate()
  } catch (err: any) {
    alert(err.message || '评测失败')
  }
}
</script>
