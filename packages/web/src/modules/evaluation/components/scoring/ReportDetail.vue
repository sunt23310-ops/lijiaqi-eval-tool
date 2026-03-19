<template>
  <div class="space-y-5">
    <!-- 返回按钮（多次评测时显示） -->
    <button
      v-if="evalStore.evaluations.length > 1"
      @click="evalStore.backToHistory()"
      class="flex items-center gap-1 text-sm text-[var(--md-primary)] hover:opacity-80 transition"
    >
      <ArrowLeft :size="16" />
      返回历史
    </button>

    <!-- 场景标签 -->
    <div v-if="evaluation.sceneType" class="flex items-center justify-center">
      <span class="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]">
        {{ sceneLabel }} · {{ gradeBadge }}
      </span>
    </div>

    <!-- 综合评分 -->
    <div class="text-center">
      <div class="text-4xl font-bold text-[var(--md-primary)]">
        {{ displayScore }}
      </div>
      <div class="text-sm text-[var(--md-on-surface-variant)] mt-1">综合评分（100分制）</div>
    </div>

    <RadarChart :scores="radarScores" />

    <!-- 排行榜 -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in rankedDimensions"
        :key="item.key"
        class="p-4 rounded-2xl bg-[var(--md-surface-container-high)]"
      >
        <div class="flex items-center gap-3 mb-1.5">
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            :class="index === 0 ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]' : 'bg-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)]'"
          >
            {{ index + 1 }}
          </span>
          <span class="text-base">{{ item.emoji }}</span>
          <span class="text-sm font-medium text-[var(--md-on-surface)]">{{ item.label }}</span>
          <span class="ml-auto text-lg font-bold text-[var(--md-primary)]">{{ item.score }}</span>
        </div>

        <!-- 分数条 (100分制) -->
        <div class="ml-9 mb-1.5">
          <div class="h-1.5 bg-[var(--md-outline-variant)] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="index === 0 ? 'bg-[var(--md-primary)]' : 'bg-[var(--md-secondary)]'"
              :style="{ width: item.score + '%' }"
            />
          </div>
        </div>

        <!-- 评分理由 -->
        <p class="ml-9 text-xs text-[var(--md-on-surface-variant)] leading-relaxed">
          {{ item.reasoning }}
        </p>
      </div>
    </div>

    <!-- 优化建议 -->
    <SuggestionList
      v-if="evaluation.suggestions?.length"
      :suggestions="evaluation.suggestions"
    />

    <!-- 评测报告 -->
    <div v-if="evaluation.reportNarrative" class="p-4 rounded-2xl bg-[var(--md-surface-container-high)]">
      <h4 class="text-sm font-medium text-[var(--md-on-surface)] mb-2">评测报告</h4>
      <p class="text-xs text-[var(--md-on-surface-variant)] leading-relaxed whitespace-pre-wrap">
        {{ evaluation.reportNarrative }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { SCENE_CONFIGS } from '@eval/shared'
import type { SceneType } from '@eval/shared'
import { useEvaluationStore } from '@/modules/evaluation/stores/evaluationStore'
import RadarChart from './RadarChart.vue'
import SuggestionList from './SuggestionList.vue'

const evalStore = useEvaluationStore()

// Legacy 5-dimension config (fallback)
const LEGACY_DIMENSIONS = [
  { key: 'intent', label: '意图识别', emoji: '🎯', weight: 0.2 },
  { key: 'context', label: '上下文理解', emoji: '🔗', weight: 0.2 },
  { key: 'persona', label: '表达拟人度', emoji: '🎭', weight: 0.25 },
  { key: 'safety', label: '内容安全', emoji: '🛡️', weight: 0.2 },
  { key: 'performance', label: '响应性能', emoji: '⚡', weight: 0.15 },
] as const

const evaluation = computed(() => evalStore.currentEvaluation!)

const sceneLabel = computed(() => {
  const st = evaluation.value?.sceneType as SceneType
  return SCENE_CONFIGS[st]?.label || '混合场景'
})

// 100分制显示
const displayScore = computed(() => {
  const score = evaluation.value?.overallScore ?? 0
  // 如果是旧格式（10分制），转换显示
  if (score <= 10 && !evaluation.value?.dimensionScores?.length) {
    return (score * 10).toFixed(0)
  }
  return score.toFixed(0)
})

const gradeBadge = computed(() => {
  const score = Number(displayScore.value)
  if (score >= 90) return 'S级'
  if (score >= 75) return 'A级'
  if (score >= 60) return 'B级'
  if (score >= 40) return 'C级'
  return 'D级'
})

// 使用新格式 dimensionScores 或回退到旧格式
const rankedDimensions = computed(() => {
  const e = evaluation.value
  if (!e) return []

  // 新格式：直接使用 dimensionScores
  if (e.dimensionScores?.length) {
    return [...e.dimensionScores]
      .sort((a, b) => b.score - a.score)
      .map(d => ({
        key: d.key,
        label: d.label,
        emoji: d.emoji,
        score: d.score,
        reasoning: d.reasoning,
      }))
  }

  // Legacy fallback
  return [...LEGACY_DIMENSIONS]
    .map(dim => ({
      key: dim.key,
      label: dim.label,
      emoji: dim.emoji,
      score: getLegacyScore(dim.key) * 10, // 转换到100分制近似
      reasoning: getLegacyReasoning(dim.key),
    }))
    .sort((a, b) => b.score - a.score)
})

const radarScores = computed(() =>
  rankedDimensions.value
    .sort((a, b) => a.key.localeCompare(b.key)) // 固定顺序给雷达图
    .map(d => ({
      name: d.label,
      value: d.score / 10, // RadarChart 期望 0-10
    }))
)

function getLegacyScore(key: string): number {
  const e = evaluation.value
  if (!e) return 0
  const map: Record<string, number | undefined> = {
    intent: e.intentScore,
    context: e.contextScore,
    persona: e.personaScore,
    safety: e.safetyScore,
    performance: e.performanceScore,
  }
  return map[key] ?? 0
}

function getLegacyReasoning(key: string): string {
  const e = evaluation.value
  if (!e) return ''
  const map: Record<string, string | undefined> = {
    intent: e.intentReasoning,
    context: e.contextReasoning,
    persona: e.personaReasoning,
    safety: e.safetyReasoning,
    performance: e.performanceReasoning,
  }
  return map[key] ?? ''
}
</script>
