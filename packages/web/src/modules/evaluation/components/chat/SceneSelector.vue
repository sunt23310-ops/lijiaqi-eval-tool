<template>
  <div class="grid grid-cols-5 gap-2">
    <button
      v-for="scene in sceneList"
      :key="scene.type"
      @click="$emit('select', scene.type)"
      class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center"
      :class="modelValue === scene.type
        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)]'
        : 'border-[var(--md-outline-variant)] hover:border-[var(--md-outline)] bg-[var(--md-surface)]'"
    >
      <span class="text-lg">{{ scene.emoji }}</span>
      <span class="text-xs font-medium" :class="modelValue === scene.type ? 'text-[var(--md-primary)]' : 'text-[var(--md-on-surface)]'">
        {{ scene.label }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { SceneType } from '@eval/shared'
import { SCENE_CONFIGS } from '@eval/shared'

defineProps<{ modelValue: SceneType }>()
defineEmits<{ select: [type: SceneType] }>()

const SCENE_EMOJIS: Record<SceneType, string> = {
  consult: '🧴',
  promo: '🎉',
  service: '🔧',
  chat: '💬',
  hybrid: '🔄',
}

const sceneList = Object.values(SCENE_CONFIGS).map(s => ({
  type: s.type,
  label: s.label,
  emoji: SCENE_EMOJIS[s.type] || '📋',
  description: s.description,
}))
</script>
