<template>
  <div>
    <div v-if="suggestions.length > 0">
      <h4 class="text-sm font-medium text-[var(--md-on-surface)] mb-2">优化建议</h4>
      <ul class="space-y-2">
        <li
          v-for="(s, i) in suggestions"
          :key="i"
          class="flex gap-2 text-sm text-[var(--md-on-surface-variant)]"
        >
          <span class="flex-shrink-0">{{ s.emoji || '💡' }}</span>
          <div>
            <span class="font-medium text-[var(--md-on-surface)]">{{ s.dimension }}</span>
            <span class="mx-1">—</span>
            <span>{{ s.reasoning }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Suggestion {
  dimension: string
  emoji: string
  reasoning: string
}

defineProps<{ suggestions: Suggestion[] }>()
</script>
