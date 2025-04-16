<template>
  <v-card class="pa-4" elevation="2">
    <v-text-field
      label="用户名"
      v-model="username"
      prepend-icon="mdi-account"
      outlined
      dense
    ></v-text-field>

    <v-text-field
      label="密码"
      v-model="password"
      prepend-icon="mdi-lock"
      type="password"
      outlined
      dense
    ></v-text-field>

    <v-row class="mt-4" justify="space-between">
      <v-col cols="6">
        <v-btn color="primary" block @click="login">登录</v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn color="secondary" block @click="register">新建账号</v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login() {
      // 登录逻辑
      console.log('登录：', this.username, this.password)
    },
    register() {
      // 注册逻辑
      console.log('新建账号')
    }
  }
}
</script>
