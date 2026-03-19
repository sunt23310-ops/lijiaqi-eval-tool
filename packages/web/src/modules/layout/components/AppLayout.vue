<template>
  <div class="flex h-screen bg-[var(--md-surface)]">
    <AppSidebar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
</script>
