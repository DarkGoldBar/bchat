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

      <!-- 登录表单组件 -->
      <v-col cols="12" md="6" class="mx-auto">
        <LoginForm />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue'
import LoginForm from '@/components/LoginForm.vue'

export default defineComponent({
  name: 'HomeView',
  components: {
    LoginForm
  }
})
</script>
