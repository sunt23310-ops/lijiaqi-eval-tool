<template>
  <div>
    <h3 class="text-sm font-medium text-[var(--md-on-surface-variant)] mb-3">
      评测历史 ({{ evalStore.evaluations.length }}次)
    </h3>

    <div class="space-y-3">
      <div
        v-for="(item, index) in evalStore.evaluations"
        :key="item.id"
        @click="evalStore.loadDetail(item.id)"
        class="p-4 rounded-2xl cursor-pointer transition-colors"
        :class="index === 0
          ? 'bg-[var(--md-primary-container)]'
          : 'bg-[var(--md-surface-container-high)] hover:bg-[var(--md-secondary-container)]'"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-[var(--md-on-surface)]">
            评测 #{{ evalStore.evaluations.length - index }}
          </span>
          <span class="text-xs text-[var(--md-on-surface-variant)]">
            {{ formatDate(item.createdAt) }}
          </span>
        </div>

        <div class="flex items-end gap-3 mb-3">
          <span class="text-3xl font-bold text-[var(--md-primary)]">
            {{ displayOverall(item) }}
          </span>
          <span class="text-sm text-[var(--md-on-surface-variant)] pb-1">综合评分</span>
        </div>

        <!-- 维度分数条 - 动态渲染 -->
        <div class="space-y-1.5">
          <div v-for="dim in getDimensions(item)" :key="dim.key" class="flex items-center gap-2">
            <span class="text-xs text-[var(--md-on-surface-variant)] w-16 truncate">{{ dim.label }}</span>
            <div class="flex-1 h-1.5 bg-[var(--md-outline-variant)] rounded-full overflow-hidden">
              <div
                class="h-full bg-[var(--md-primary)] rounded-full transition-all"
                :style="{ width: dim.score + '%' }"
              />
            </div>
            <span class="text-xs font-medium text-[var(--md-on-surface)] w-6 text-right">
              {{ dim.score }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEvaluationStore } from '@/modules/evaluation/stores/evaluationStore'
import type { EvaluationSummary } from '@eval/shared'

const evalStore = useEvaluationStore()

const LEGACY_DIMENSIONS = [
  { key: 'intent', label: '意图识别' },
  { key: 'context', label: '上下文理解' },
  { key: 'persona', label: '拟人度' },
  { key: 'safety', label: '内容安全' },
  { key: 'performance', label: '响应性能' },
]

function getDimensions(item: EvaluationSummary): Array<{ key: string; label: string; score: number }> {
  // New format: use dimensionScores directly
  if (item.dimensionScores?.length) {
    return item.dimensionScores.map(d => ({
      key: d.key,
      label: d.label,
      score: d.score,
    }))
  }

  // Legacy fallback
  const legacy = item as any
  return LEGACY_DIMENSIONS.map(dim => {
    const scoreMap: Record<string, string> = {
      intent: 'intentScore', context: 'contextScore',
      persona: 'personaScore', safety: 'safetyScore', performance: 'performanceScore',
    }
    const raw = (legacy[scoreMap[dim.key]] as number) ?? 0
    return { key: dim.key, label: dim.label, score: raw * 10 } // approximate 100-scale
  })
}

function displayOverall(item: EvaluationSummary): string {
  const score = item.overallScore ?? 0
  // If has new dimensionScores, it's already 100-scale
  if (item.dimensionScores?.length) return score.toFixed(0)
  // Legacy: was 10-scale
  return score <= 10 ? (score * 10).toFixed(0) : score.toFixed(0)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
