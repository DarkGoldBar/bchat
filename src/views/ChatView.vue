<template>
  <v-container class="h-100 d-flex flex-column">
    <!-- 顶部标题区域 -->
    <v-row align="center" class="py-2 px-3 flex-grow-0 border-b">
      <v-btn icon @click="router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 font-weight-medium ml-2">{{ friendName }}</span>
    </v-row>

    <!-- 消息区域 -->
    <v-row dense class="flex-grow-1">
      <v-col cols="12">
        <div ref="scrollArea" class="p-3 h-100 overflow-y-auto overflow-x-hidden">
          <v-row dense>
            <v-col
              cols="12"
              v-for="(msg, index) in messages"
              :key="index"
              :class="msg.userId === userId ? 'text-right' : 'text-left'"
            >
              <v-chip
                color="blue lighten-4"
                class="ma-1"
                :class="msg.userId === userId ? 'ml-auto' : 'mr-auto'"
              >
                {{ msg.text }}
              </v-chip>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

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

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// const route = useRoute()

const userId = 'ZhangSan'
// const friendId = route.params.friendId
const friendName = '张三'

const input = ref('')
const messages = ref([])
const scrollArea = ref(null)

const scrollToBottom = () => {
  const el = scrollArea.value
  if (el && el.scrollTo) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }
}

const fetchMessages = async () => {
  messages.value = await Promise.resolve([
    { userId: 'ZhangSan', text: '你好' },
    { userId: 'LiSi', text: '你好啊' },
    { userId: 'ZhangSan', text: '今天天气真不错' }
    // ...可继续添加更多消息
  ])
  await nextTick()
  scrollToBottom()
}

const sendMessage = () => {
  if (!input.value.trim()) return
  messages.value.push({ userId, text: input.value })
  input.value = ''
  nextTick(scrollToBottom)
}

onMounted(fetchMessages)
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>
