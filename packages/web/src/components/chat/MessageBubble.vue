<template>
  <div class="flex gap-3" :class="isUser ? 'flex-row-reverse' : ''">
    <!-- 头像 -->
    <div
      class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      :class="isUser
        ? 'bg-[var(--md-primary-container)]'
        : 'bg-[var(--md-tertiary-container)]'"
    >
      <User v-if="isUser" :size="16" class="text-[var(--md-primary)]" />
      <Bot v-else :size="16" class="text-[var(--md-tertiary)]" />
    </div>

    <!-- 气泡 -->
    <div
      class="max-w-[70%] px-4 py-3 rounded-2xl text-sm"
      :class="isUser
        ? 'rounded-tr-sm bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
        : 'rounded-tl-sm bg-[var(--md-surface-container)] text-[var(--md-on-surface)]'"
    >
      <div v-if="isUser">{{ message.content }}</div>
      <div v-else v-html="renderMarkdown(message.content)" class="prose prose-sm" />

      <!-- 性能指标 -->
      <div v-if="!isUser && message.latencyMs" class="mt-2 flex gap-3 text-xs text-[var(--md-on-surface-variant)]">
        <span v-if="message.ttftMs">TTFT: {{ message.ttftMs }}ms</span>
        <span>总耗时: {{ message.latencyMs }}ms</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Bot } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import type { Message } from '@/types/message'

const props = defineProps<{ message: Message }>()
const isUser = computed(() => props.message.role === 'user')

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
function renderMarkdown(content: string) {
  return md.render(content)
}
</script>
