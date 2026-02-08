<template>
  <div class="flex-1 flex flex-col min-w-0 bg-[var(--md-surface)]">
    <!-- 顶部栏 -->
    <div class="h-14 flex items-center justify-between px-6 border-b border-[var(--md-outline-variant)]">
      <h2 class="text-base font-medium text-[var(--md-on-surface)] truncate">
        {{ chatStore.currentSession?.name || '选择或创建会话' }}
      </h2>
      <MockDataControls v-if="chatStore.currentSessionId" />
    </div>

    <!-- 消息列表 -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      <template v-if="chatStore.currentSessionId">
        <MessageBubble
          v-for="msg in chatStore.messages"
          :key="msg.id"
          :message="msg"
        />

        <!-- 流式响应 -->
        <div v-if="chatStore.isStreaming" class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-[var(--md-tertiary-container)] flex items-center justify-center flex-shrink-0">
            <Bot :size="16" class="text-[var(--md-tertiary)]" />
          </div>
          <div class="max-w-[70%] px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--md-surface-container)] text-sm text-[var(--md-on-surface)]">
            <div v-html="renderMarkdown(chatStore.streamingContent || '...')" class="prose prose-sm" />
            <span class="inline-block w-1.5 h-4 bg-[var(--md-primary)] animate-pulse ml-0.5 align-text-bottom rounded-sm" />
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center justify-center h-full text-[var(--md-on-surface-variant)]">
        <MessageSquare :size="48" class="mb-4 opacity-30" />
        <p class="text-sm">选择左侧会话或创建新会话开始对话</p>
      </div>
    </div>

    <!-- 输入框 -->
    <MessageInput
      v-if="chatStore.currentSessionId"
      @send="handleSend"
      :disabled="chatStore.isStreaming || chat.autoSending.value"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Bot, MessageSquare } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import { useChatStore } from '@/stores/chatStore'
import { useChat } from '@/composables/useChat'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import MockDataControls from './MockDataControls.vue'

const chatStore = useChatStore()
const chat = useChat()
const messagesContainer = ref<HTMLElement | null>(null)

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

function renderMarkdown(content: string) {
  return md.render(content)
}

function handleSend(content: string) {
  chat.send(content)
}

// 自动滚动到底部
watch(
  () => [chatStore.messages.length, chatStore.streamingContent],
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
)
</script>
