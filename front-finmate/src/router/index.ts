import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: () => import('@/pages/LandingPage.vue'),
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
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/pages/Profile.vue'),
        },
        {
          path: 'categories',
          name: 'Categories',
          component: () => import('@/pages/Categories.vue'),
        },
        {
          path: 'movements',
          name: 'Movements',
          component: () => import('@/pages/Movements.vue'),
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  const guestRoutes = new Set(['Landing', 'Login', 'Register']);

  if (!auth.appReady && !guestRoutes.has(to.name as string)) {
    await auth.initialize();
  }

  if (!auth.isAuthenticated && !guestRoutes.has(to.name as string)) {
    return { name: 'Login' };
  }
  if (auth.isAuthenticated && guestRoutes.has(to.name as string)) {
    return { name: 'Dashboard' };
  }
});

export default router;
