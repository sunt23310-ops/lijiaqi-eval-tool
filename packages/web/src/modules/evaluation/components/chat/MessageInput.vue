<template>
  <div class="px-6 py-3 border-t border-[var(--md-outline-variant)]">
    <div class="flex gap-3 items-end">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        @keydown.enter.exact.prevent="handleSend"
        :disabled="disabled"
        placeholder="输入消息..."
        rows="1"
        class="flex-1 px-4 py-2.5 rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] text-[var(--md-on-surface)] text-sm resize-none focus:outline-none focus:border-[var(--md-primary)] transition disabled:opacity-50"
        style="max-height: 120px"
        @input="autoResize"
      />
      <button
        @click="handleSend"
        :disabled="disabled || !inputText.trim()"
        class="p-2.5 rounded-xl bg-[var(--md-primary)] text-[var(--md-on-primary)] hover:opacity-90 disabled:opacity-40 transition flex-shrink-0"
      >
        <Send :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Send } from 'lucide-vue-next'

defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ send: [content: string] }>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function handleSend() {
  if (!inputText.value.trim()) return
  emit('send', inputText.value.trim())
  inputText.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}
</script>
