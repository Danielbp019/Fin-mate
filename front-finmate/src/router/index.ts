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
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/pages/ForgotPassword.vue'),
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('@/pages/ResetPassword.vue'),
    },
    {
      path: '/como-funciona',
      name: 'HowItWorks',
      component: () => import('@/pages/HowItWorks.vue'),
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
        {
          path: 'debts',
          name: 'Debts',
          component: () => import('@/pages/Debts.vue'),
        },
        {
          path: 'couples',
          name: 'Couples',
          component: () => import('@/pages/Couples.vue'),
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  const guestRoutes = new Set(['Landing', 'Login', 'Register', 'HowItWorks', 'ForgotPassword', 'ResetPassword']);

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
