import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/wuziqi',
    name: 'Wuziqi',
    component: () => import('./views/WuziqiView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
