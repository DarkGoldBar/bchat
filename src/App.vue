<script setup>
import { ref } from 'vue'

const drawer = ref(false)

if (import.meta.env.MODE === 'development') {
  console.log('开发模式。', import.meta.env)
}
</script>

<template>
  <v-app class="h-screen">
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>BChat</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer" temporary>
      <v-list>
        <v-list-item to="/" title="首页" />
        <v-list-item to="/about" title="关于" />
      </v-list>
    </v-navigation-drawer>

    <v-main class="h-100 overflow-hidden">
      <router-view />
    </v-main>
  </v-app>
</template>
