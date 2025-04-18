<template>
  <v-container class="flex-grow-1 h-100 d-flex flex-column">
    <!-- 顶部标题区域（不使用 v-app-bar） -->
    <v-row align="center" class="py-2 px-3 flex-grow-0 border-b">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 font-weight-medium ml-2">{{ friendName }}</span>
    </v-row>

    <!-- 消息区域 -->
    <div class="flex-grow-1 overflow-y-auto px-2" ref="scrollArea">
      <v-container fluid>
        <v-row dense>
          <v-col cols="12" v-for="(msg, index) in messages" :key="index">
            <div :class="msg.userId === userId ? 'text-right' : 'text-left'">
              <v-chip
                color="blue lighten-4"
                class="ma-1"
                :class="msg.userId === userId ? 'ml-auto' : 'mr-auto'"
              >
                {{ msg.text }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- 底部输入区域 -->
    <v-sheet class="pa-2 d-flex align-center" elevation="2" width="100%">
      <v-text-field
        v-model="input"
        placeholder="输入消息..."
        hide-details
        dense
        solo
        class="flex-grow-1 mr-2"
        @keyup.enter="sendMessage"
      />
      <v-btn color="primary" @click="sendMessage">发送</v-btn>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  name: 'ChatView',
  data() {
    return {
      userId: 'ZhangSan',
      friendId: this.$route.params.friendId,
      friendName: '张三',
      input: '',
      messages: []
    }
  },
  mounted() {
    this.fetchMessages()
  },
  methods: {
    async fetchMessages() {
      this.messages = await Promise.resolve([
        { userId: 'ZhangSan', text: '你好' },
        { userId: 'LiSi', text: '你好啊' },
        { userId: 'ZhangSan', text: '今天天气真不错' }
      ])
      this.$nextTick(() => {
        const el = this.$refs.scrollArea
        el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      })
    },
    sendMessage() {
      if (!this.input.trim()) return
      this.messages.push({ userId: this.userId, text: this.input })
      this.input = ''
    }
  }
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>
