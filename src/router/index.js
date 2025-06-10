import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// import ChatView from '../views/ChatView.vue'
// import ChatList from '../views/ChatList.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  // {
  //   path: '/chat',
  //   name: 'chat',
  //   component: ChatList
  // },
  // {
  //   path: '/chat/:friendId',
  //   name: 'ChatView',
  //   component: ChatView
  // },
  {
    path: '/wuziqi',
    name: 'Wuziqi',
    component: () => import('@/views/WuziqiGame.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
