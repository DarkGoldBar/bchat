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
  {
    name: 'dummy1',
    type: 'dummy1',
    route: '/dummy1'
  },
  {
    name: 'dummy2',
    type: 'dummy2',
    route: '/dummy2'
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
      <v-col cols="12" class="mb-4">
        <v-img :src="'./logo.png'" class="my-3" contain height="200" />
        <p class="font-weight-regular">Welcome to BChat, a simple game application.</p>
        <v-divider class="my-3" />
        <h3 class="text-h5">Quick Start:</h3>
      </v-col>

      <v-col cols="4" class="mx-auto" v-for="game in gamelist" :key="game.name">
        <v-card link @click="handleGameClick(game)">
          <v-card-text>
            {{ game.name }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>

  </v-container>
</template>
