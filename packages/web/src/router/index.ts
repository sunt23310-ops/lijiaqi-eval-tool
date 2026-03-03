import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

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
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Workspace',
          component: () => import('@/views/EvalWorkspace.vue'),
        },
        {
          path: 'sensitive-words',
          name: 'SensitiveWords',
          component: () => import('@/views/SensitiveWordsView.vue'),
        },
        {
          path: 'model-database',
          name: 'ModelDatabase',
          component: () => import('@/views/ModelDatabaseView.vue'),
        },
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
