import type { RouteRecordRaw } from 'vue-router'

export const evaluationRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Workspace',
    component: () => import('./views/EvalWorkspace.vue'),
  },
]
