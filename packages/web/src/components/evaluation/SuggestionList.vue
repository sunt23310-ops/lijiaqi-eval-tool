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
          <Lightbulb :size="14" class="flex-shrink-0 mt-0.5 text-[var(--md-tertiary)]" />
          <span>{{ s }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb } from 'lucide-vue-next'

defineProps<{ suggestions: string[] }>()
</script>
