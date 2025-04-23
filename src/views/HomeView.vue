<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img :src="require('../assets/logo.png')" class="my-3" contain height="200" />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">欢迎来到 BChat</h1>
        <p class="subheading font-weight-regular">
          Welcome to BChat, a simple chat application built with Vue 3 and Vuetify 3.
        </p>
      </v-col>

      <!-- 登录区域 -->
      <v-col cols="12" md="6" class="mx-auto">
        <div v-if="user">
          <v-card class="pa-4" elevation="2">
            <p class="text-h6 mb-4">欢迎回来，{{ user.userId }}</p>
            <v-btn color="error" @click="logout">退出登录</v-btn>
          </v-card>
        </div>
        <LoginForm v-else />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginForm from '@/components/LoginForm.vue'
import { useAuth } from '@/composables/useAuth'

const { getUserFromToken, removeToken } = useAuth()
const user = ref(null)

onMounted(() => {
  const u = getUserFromToken()
  if (u) {
    user.value = u
  }
})

const logout = () => {
  removeToken()
  location.reload() // 刷新页面以重置视图
}
</script>
