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
          <v-card-title>游戏列表</v-card-title>
          <v-list nav dense>
            <v-list-item
              v-for="game in games"
              :key="game.name"
              :to="game.route"
              link
              tag="router-link"
            >
              <v-list-item-title>{{ game.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const games = [{ name: '五子棋', route: '/wuziqi' }]
</script>
