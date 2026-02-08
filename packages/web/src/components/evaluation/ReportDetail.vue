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

    <!-- 综合评分 + 雷达图 -->
    <div class="text-center">
      <div class="text-4xl font-bold text-[var(--md-primary)]">
        {{ evaluation.overallScore?.toFixed(1) }}
      </div>
      <div class="text-sm text-[var(--md-on-surface-variant)] mt-1">综合评分</div>
    </div>

    <RadarChart :scores="radarScores" />

    <!-- 排行榜：5 个维度按分数降序 -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in rankedDimensions"
        :key="item.key"
        class="p-4 rounded-2xl bg-[var(--md-surface-container-high)]"
      >
        <div class="flex items-center gap-3 mb-1.5">
          <!-- 排名标记 -->
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            :class="index === 0 ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]' : 'bg-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)]'"
          >
            {{ index + 1 }}
          </span>
          <span class="text-base">{{ item.emoji }}</span>
          <span class="text-sm font-medium text-[var(--md-on-surface)]">{{ item.label }}</span>
          <span class="ml-auto text-lg font-bold text-[var(--md-primary)]">{{ item.score.toFixed(1) }}</span>
        </div>

        <!-- 分数条 -->
        <div class="ml-9 mb-1.5">
          <div class="h-1.5 bg-[var(--md-outline-variant)] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="index === 0 ? 'bg-[var(--md-primary)]' : 'bg-[var(--md-secondary)]'"
              :style="{ width: ((item.score / 10) * 100) + '%' }"
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
import { useEvaluationStore } from '@/stores/evaluationStore'
import { DIMENSION_CONFIG } from '@/types/evaluation'
import RadarChart from './RadarChart.vue'
import SuggestionList from './SuggestionList.vue'

const evalStore = useEvaluationStore()

const evaluation = computed(() => evalStore.currentEvaluation!)

const radarScores = computed(() =>
  DIMENSION_CONFIG.map((dim) => ({
    name: dim.label,
    value: getScore(dim.key),
  }))
)

const rankedDimensions = computed(() => {
  return [...DIMENSION_CONFIG]
    .map((dim) => ({
      ...dim,
      score: getScore(dim.key),
      reasoning: getReasoning(dim.key),
    }))
    .sort((a, b) => b.score - a.score)
})

function getScore(key: string): number {
  const e = evaluation.value
  const map: Record<string, number> = {
    intent: e.intentScore,
    context: e.contextScore,
    fluency: e.fluencyScore,
    safety: e.safetyScore,
    performance: e.performanceScore,
  }
  return map[key] ?? 0
}

function getReasoning(key: string): string {
  const e = evaluation.value
  const map: Record<string, string> = {
    intent: e.intentReasoning,
    context: e.contextReasoning,
    fluency: e.fluencyReasoning,
    safety: e.safetyReasoning,
    performance: e.performanceReasoning,
  }
  return map[key] ?? ''
}
</script>
