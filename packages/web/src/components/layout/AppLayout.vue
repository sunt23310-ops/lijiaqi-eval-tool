<template>
  <div class="flex h-screen bg-[var(--md-surface)]">
    <SessionSidebar />
    <ChatPanel />
    <EvaluationPanel />
  </div>
</template>

<script setup lang="ts">
import SessionSidebar from './SessionSidebar.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import EvaluationPanel from '@/components/evaluation/EvaluationPanel.vue'
</script>
