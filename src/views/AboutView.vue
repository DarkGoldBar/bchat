<script>
import { ref } from 'vue'

const name = ref('AboutView')
const githubIssuesUrl = ref('https://github.com/DarkGoldBar/bchat/issues')
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4" elevation="2">
          <v-card-title class="text-h5 font-weight-bold"> 关于 BChat </v-card-title>

          <v-card-text class="mt-2">
            <p>
              <strong>BChat</strong>: 我的聊天游戏平台。
            </p>

            <!-- 技术徽章 -->
            <div class="my-4">
              <v-img
                src="https://img.shields.io/badge/Vue-3.x-brightgreen"
                height="24"
                class="mr-2"
                inline
              />
              <v-img
                src="https://img.shields.io/badge/Vuetify-3.x-blue"
                height="24"
                class="mr-2"
                inline
              />
              <v-img
                src="https://img.shields.io/badge/PWA-supported-orange"
                height="24"
                class="mr-2"
                inline
              />
            </div>

            <!-- 反馈按钮 -->
            <v-btn
              color="primary"
              variant="outlined"
              :href="githubIssuesUrl"
              target="_blank"
              class="mt-2"
            >
              给我反馈
            </v-btn>

            <p class="text-caption mt-4">
              开发者：DarkGoldBar <br />
              技术栈：Vue 3 / Vuetify 3 / Vue-Router
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
