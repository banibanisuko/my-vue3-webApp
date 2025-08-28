import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/home',
      redirect: '/home/0',
    },
    {
      path: '/home/:userId',
      name: 'mainTodo',
      component: () => import('@/views/MainTodo.vue'),
    },
    {
      path: '/posts/new',
      name: 'publish',
      component: () => import('@/views/ArticleEntryPage.vue'),
    },
    {
      path: '/posts',
      name: 'article',
      component: () => import('@/views/ArticleCatchPage.vue'),
    },
    {
      path: '/posts/:id',
      name: 'articlePage',
      component: () => import('@/views/ArticlePage.vue'),
    },
    {
      path: '/profile',
      name: 'ProfilePage',
      component: () => import('@/views/ProfilePage.vue'),
    },
    {
      path: '/profile/edit',
      name: 'ProfileEditPage',
      component: () => import('@/views/ProfileEditPage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: {
        showHeader: false,
        showProfile: false, // ← ログイン時にヘッダーやプロフィール表示を制御したい場合
      },
    },
    {
      path: '/posts/edit',
      redirect: '/posts/0/edit',
    },
    {
      path: '/posts/edit/:id',
      name: 'edit',
      component: () => import('@/views/ArticleEditPage.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchPage.vue'),
    },
    {
      path: '/register/temporary',
      name: 'temporary',
      component: () => import('@/views/TemporaryRegisterPage.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterPage.vue'),
    },
    {
      path: '/register-error',
      name: 'RegisterError',
      component: () => import('@/views/RegisterErrorPage.vue'),
    },
    {
      path: '/register/complete',
      name: 'RegisterComplete',
      component: () => import('@/views/RegisterCompletePage.vue'),
      props: route => ({
        message: route.query.message || '登録が完了しました！',
      }),
    },
    {
      path: '/invalid-token',
      name: 'InvalidToken',
      component: () => import('@/views/InvalidTokenPage.vue'),
    },
    {
      path: '/user-favorite',
      name: 'UserFavorite',
      component: () => import('@/views/FavoritePage.vue'),
    },
    {
      path: '/user-profile',
      redirect: '/user-profile/0',
    },
    {
      path: '/user-profile/:id',
      name: 'UserProfile',
      component: () => import('@/views/UserPage.vue'),
    },
  ],
  scrollBehavior() {
    // 遷移後は必ず最上部へスクロール
    return { top: 0 }
  },
})

export default router
