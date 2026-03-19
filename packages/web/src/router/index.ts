import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { evaluationRoutes } from '@/modules/evaluation/routes'
import { managementRoutes } from '@/modules/management/routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/modules/layout/components/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        // Zone B: AI 评测 (默认)
        ...evaluationRoutes,
        // Zone C: 系统管理
        ...managementRoutes,
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login' }
  }
  if (to.name === 'Login' && authStore.isLoggedIn) {
    return { name: 'Workspace' }
  }
})

export default router
