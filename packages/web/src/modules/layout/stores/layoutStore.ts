import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ActiveZone = 'evaluation' | 'management'

export const useLayoutStore = defineStore('layout', () => {
  const sidebarCollapsed = ref(false)
  const activeZone = ref<ActiveZone>('evaluation')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setActiveZone(zone: ActiveZone) {
    activeZone.value = zone
  }

  return {
    sidebarCollapsed,
    activeZone,
    toggleSidebar,
    setActiveZone,
  }
})
