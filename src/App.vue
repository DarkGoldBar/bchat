<template>
  <v-app class="fill-height d-flex flex-column">
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>BChat</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer" temporary>
      <v-list>
        <v-list-item to="/" title="首页" />
        <v-list-item to="/chat" title="聊天" />
        <v-list-item to="/about" title="关于" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(false)
</script>
