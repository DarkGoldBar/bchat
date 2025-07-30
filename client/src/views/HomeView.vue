<script setup>
import { useRouter } from 'vue-router'
import { inject, ref } from 'vue'

const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL

const snackbarCall = inject('snackbarCall')

const gamelist = ref([
  {
    name: '五子棋',
    type: 'wuziqi',
    route: '/wuziqi',
    roomId: ''
  },
  {
    name: 'dummy1',
    type: 'dummy1',
    route: '/dummy1',
    roomId: ''
  },
  {
    name: 'dummy2',
    type: 'dummy2',
    route: '/dummy2',
    roomId: ''
  },
])

function handleGameCreate(game) {
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
        query: { roomId: data.roomId }
      });
    })
    .catch((error) => {
      snackbarCall('创建游戏房间失败:', 'error')
    });
};

function handleGameJoin(game) {
  router.push({
    path: game.route,
    query: { roomId: game.roomId }
  });
}
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

      <v-col cols="6" sm="4" lg="3" class="mx-auto" v-for="game in gamelist" :key="game.name">
        <v-card>
          <v-card-title>
            {{ game.name }}
          </v-card-title>
          <v-card-text>
            <v-text-field hint="输入一个房间ID来加入房间" label="房间ID" v-model="game.roomId">
            </v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="handleGameCreate(game)">新建</v-btn>
            <v-btn @click="handleGameJoin(game)">加入</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
