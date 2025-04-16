<template>
  <v-card class="pa-4" elevation="2">
    <v-form ref="formRef">
      <v-text-field
        label="用户名"
        v-model="username"
        prepend-icon="mdi-account"
        outlined
        dense
        :rules="usernameRules"
      ></v-text-field>

      <v-text-field
        label="密码"
        v-model="password"
        prepend-icon="mdi-lock"
        type="password"
        outlined
        dense
        :rules="passwordRules"
      ></v-text-field>

      <v-row class="mt-4" justify="space-between">
        <v-col cols="6">
          <v-btn color="primary" block @click="login">登录</v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn color="secondary" block @click="handleRegisterClick">新建账号</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- 注册确认对话框 -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">确认注册</v-card-title>
        <v-card-text>
          是否确认注册用户名为「<strong>{{ username }}</strong
          >」的用户？
          <div class="text-caption text-red mt-2">注册不需要邮箱，所以请牢记密码，无法找回。</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">取消</v-btn>
          <v-btn color="primary" text @click="confirmRegister">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      username: '',
      password: '',
      dialog: false,
      usernameRules: [(v) => !!v || '用户名不能为空'],
      passwordRules: [(v) => !!v || '密码不能为空']
    }
  },
  methods: {
    login() {
      const isValid = this.$refs.formRef.validate()
      if (!isValid) return false
      // TODO: 处理登录逻辑
      console.log('登录：', this.username, this.password)
    },
    handleRegisterClick() {
      const isValid = this.$refs.formRef.validate()
      if (!isValid) return false
      // TODO: 处理注册逻辑
      this.dialog = true
    },
    confirmRegister() {
      this.dialog = false
      console.log('注册用户：', this.username, this.password)
    }
  }
}
</script>
