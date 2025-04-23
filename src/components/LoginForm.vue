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

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { request, error } = useApi()
const { setToken } = useAuth()
// 表单状态
const username = ref('')
const password = ref('')
const dialog = ref(false)

// 表单验证规则
const usernameRules = [(v) => !!v || '用户名不能为空']
const passwordRules = [(v) => !!v || '密码不能为空']

// 表单引用
const formRef = ref(null)

// 登录处理
// {"userId":"zhangsan","name":"zhangsan","avatar":"","createdAt":1745399359785,"token":"jwt_token"}
const login = async () => {
  const result = await formRef.value.validate()
  if (!result.valid) return

  const res = await request('/user?action=login', {
    method: 'POST',
    body: JSON.stringify({
      userId: username.value,
      password: password.value
    })
  })

  if (res) {
    setToken(res.token)
    console.log('登录成功:', res)
    router.push('/chat')
  } else {
    console.error('登录失败', error.value)
  }
}
// 注册处理（弹出确认框）
const handleRegisterClick = async () => {
  const result = await formRef.value.validate()
  if (!result.valid) return
  dialog.value = true
}

// 确认注册
const confirmRegister = async () => {
  dialog.value = false
  const res = await request('/user?action=register', {
    method: 'POST',
    body: JSON.stringify({
      userId: username.value,
      password: password.value
    })
  })

  if (res) {
    setToken(res.token)
    console.log('登录成功:', res)
    router.push('/chat')
  } else {
    console.error('注册失败', error.value)
  }
}
</script>
