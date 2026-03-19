import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SceneType } from '@eval/shared'

export const useSceneStore = defineStore('scene', () => {
  const currentScene = ref<SceneType>('hybrid')

  function setScene(scene: SceneType) {
    currentScene.value = scene
  }

  return {
    currentScene,
    setScene,
  }
})
