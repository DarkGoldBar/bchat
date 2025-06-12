<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img :src="require('../assets/logo.png')" class="my-3" contain height="200" />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">欢迎来到 BChat</h1>
        <p class="subheading font-weight-regular">Welcome to BChat, a simple game application.</p>
      </v-col>

      <!-- 游戏列表 -->
      <v-col cols="12" md="6" class="mx-auto">
        <v-card>
          <v-card-title>Create a game room</v-card-title>
          <v-list nav dense>
            <v-list-item v-for="game in games" :key="game.name" link @click="handleGameClick(game)">
              {{ game.name }}
              <v-list-item-title>{{ game.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL

// 定义游戏列表
const games = ref([
  { 
    name: 'wuziqi', 
    type: 'wuziqi',
    route: '/wuziqi' 
  },
])

// 获取路由实例
const router = useRouter()

// Snackbar 相关的响应式变量
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('error')

// 处理游戏点击事件
const handleGameClick = async (game) => {
  try {
    // 发送POST请求
    const response = await axios.post(`${API_URL}/room?type=${game.type}`)

    // 获取返回的roomId
    const roomId = response.data.id

    // 使用路由跳转，并带上roomId参数
    router.push({
      path: game.route,
      query: { room: roomId }
    })
  } catch (error) {
    // 处理错误
    console.error('创建游戏房间失败:', error)
    
    // 显示错误提示
    snackbarMessage.value = '无法创建游戏房间'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>
