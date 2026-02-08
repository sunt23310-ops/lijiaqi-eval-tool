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
            {{ item.overallScore?.toFixed(1) }}
          </span>
          <span class="text-sm text-[var(--md-on-surface-variant)] pb-1">综合评分</span>
        </div>

        <!-- 维度分数条 -->
        <div class="space-y-1.5">
          <div v-for="dim in dimensions" :key="dim.key" class="flex items-center gap-2">
            <span class="text-xs text-[var(--md-on-surface-variant)] w-16 truncate">{{ dim.label }}</span>
            <div class="flex-1 h-1.5 bg-[var(--md-outline-variant)] rounded-full overflow-hidden">
              <div
                class="h-full bg-[var(--md-primary)] rounded-full transition-all"
                :style="{ width: ((getScore(item, dim.key) / 10) * 100) + '%' }"
              />
            </div>
            <span class="text-xs font-medium text-[var(--md-on-surface)] w-6 text-right">
              {{ getScore(item, dim.key).toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEvaluationStore } from '@/stores/evaluationStore'
import { DIMENSION_CONFIG, type EvaluationSummary } from '@/types/evaluation'

const evalStore = useEvaluationStore()
const dimensions = DIMENSION_CONFIG

function getScore(item: EvaluationSummary, key: string): number {
  const scoreMap: Record<string, keyof EvaluationSummary> = {
    intent: 'intentScore',
    context: 'contextScore',
    fluency: 'fluencyScore',
    safety: 'safetyScore',
    performance: 'performanceScore',
  }
  return (item[scoreMap[key]] as number) ?? 0
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
