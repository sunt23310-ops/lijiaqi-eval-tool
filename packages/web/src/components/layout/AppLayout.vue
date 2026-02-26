<template>
  <div class="flex h-screen bg-[var(--md-surface)]">
    <SessionSidebar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import SessionSidebar from './SessionSidebar.vue'
</script>
