<template>
  <div>
    <div class="flex items-center gap-2 text-sm font-medium text-[var(--md-on-surface)] mb-2">
      <span class="text-[var(--md-on-surface-variant)]">{{ dim.emoji }}</span>
      <span>{{ dim.label }}</span>
      <span class="ml-auto text-lg font-bold text-[var(--md-primary)]">{{ score.toFixed(1) }}</span>
    </div>
    <p class="text-xs text-[var(--md-on-surface-variant)] line-clamp-2 leading-relaxed">
      {{ reasoning }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dim: { key: string; label: string; emoji: string; weight: number }
  score: number
  reasoning: string
}>()
</script>
