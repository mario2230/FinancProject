import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import { useAuth } from '@/service/userAuth';

const { getSession } = useAuth();

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/receitas',
    component: () => import('@/views/IncomePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/despesas',
    component: () => import('@/views/ExpensesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/perfil',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tabs/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);

  try {
    const session = await getSession();

    if (requiresAuth && !session) {
      return '/login';
    }

    if (guestOnly && session) {
      return '/dashboard';
    }
  } catch (error) {
    console.error('Não foi possível verificar a sessão do usuário.', error);

    if (requiresAuth) {
      return '/login';
    }
  }

  return true;
});

export default router;
