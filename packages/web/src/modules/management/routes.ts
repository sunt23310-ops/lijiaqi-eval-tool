import type { RouteRecordRaw } from 'vue-router'

export const managementRoutes: RouteRecordRaw[] = [
  {
    path: 'management/sensitive-words',
    name: 'SensitiveWords',
    component: () => import('./views/SensitiveWordsView.vue'),
  },
  {
    path: 'management/knowledge-base',
    name: 'KnowledgeBase',
    component: () => import('./views/KnowledgeBaseView.vue'),
  },
  {
    path: 'management/content-review',
    name: 'ContentReview',
    component: () => import('./views/ContentReviewView.vue'),
  },
]
