<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL

const gamelist = ref([
  {
    name: 'wuziqi',
    type: 'wuziqi',
    route: '/wuziqi'
  },
])

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('error')

// 处理游戏点击事件
const handleGameClick = (game) => {
  fetch(`${API_URL}/room?type=${game.type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      router.push({
        path: game.route,
        query: { room: data.id }
      });
    })
    .catch((error) => {
      console.error('创建游戏房间失败:', error);
      snackbarMessage.value = '无法创建游戏房间';
      snackbarColor.value = 'error';
      snackbar.value = true;
    });
};
</script>

<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img :src="'./logo.png'" class="my-3" contain height="200" />
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
            <v-list-item v-for="game in gamelist" :key="game.name" link @click="handleGameClick(game)">
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
