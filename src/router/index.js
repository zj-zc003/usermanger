import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import UserManagementView from '@/views/UserManagementView.vue'
import MaterialManagement from '@/views/MaterialManagement.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/materials',
    name: 'MaterialManagement',
    component: MaterialManagement
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/user',
    children: [
      {
        path: '/user',
        name: 'UserManagement',
        component: UserManagementView
      },
      // 其他功能路由可在此扩展
      /*{
        path: '/product',
        name: 'Product',
        component: () => import('@/views/PlaceholderView.vue')
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/PlaceholderView.vue')
      }*/
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router