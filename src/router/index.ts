import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'generator',
      component: () => import('@/views/GeneratorView.vue'),
    },
    {
      path: '/learn',
      name: 'learn',
      component: () => import('@/views/LearnView.vue'),
    },
    {
      path: '/credits',
      name: 'credits',
      component: () => import('@/views/CreditsView.vue'),
    },
    {
      path: '/legal',
      name: 'legal',
      component: () => import('@/views/LegalView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
