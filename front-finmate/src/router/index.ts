import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/Register.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/pages/Dashboard.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(to => {
  const auth = useAuthStore()
  const guestRoutes = new Set(['Login', 'Register'])
  if (!auth.isAuthenticated && !guestRoutes.has(to.name as string)) {
    return { name: 'Login' }
  }
  if (auth.isAuthenticated && guestRoutes.has(to.name as string)) {
    return { name: 'Dashboard' }
  }
})

export default router
