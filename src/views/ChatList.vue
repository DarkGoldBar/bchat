<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-3">聊天列表</h2>
        <v-sheet
          v-for="friend in friends"
          :key="friend.id"
          class="py-3 px-2"
          border
          rounded
          @click="openChat(friend)"
        >
          <v-row no-gutters align="center">
            <!-- Avatar -->
            <v-col cols="auto">
              <v-img
                :src="friend.avatar"
                height="48"
                width="48"
                class="rounded-circle mr-3"
                cover
              />
            </v-col>

            <!-- Name and message -->
            <v-col>
              <div class="d-flex justify-space-between">
                <span class="font-weight-medium">{{ friend.name }}</span>
                <span class="text-caption text-grey">{{ formatTime(friend.lastMessageTime) }}</span>
              </div>
              <div class="text-body-2 text-truncate text-grey-darken-1">
                {{ friend.lastMessage }}
              </div>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ChatList',
  data() {
    return {
      friends: []
    }
  },
  mounted() {
    this.fetchFriends()
  },
  methods: {
    async fetchFriends() {
      // 假设是从后端 API 获取好友数据
      // 你可以替换为真实 API 请求
      this.friends = await Promise.resolve([
        {
          id: 1,
          name: '张三',
          avatar: 'https://i.pravatar.cc/100?img=1',
          lastMessage: '嘿，你好！',
          lastMessageTime: '2025-04-16T15:30:00'
        },
        {
          id: 2,
          name: '李四',
          avatar: 'https://i.pravatar.cc/100?img=2',
          lastMessage: '我们明天几点见？',
          lastMessageTime: '2025-04-16T14:10:00'
        }
      ])
    },
    formatTime(timeStr) {
      const date = new Date(timeStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    openChat(friend) {
      // 跳转到聊天页面或打开对话（你可以替换为 router.push）
      console.log('打开与', friend.name, '的聊天')
    }
  }
}
</script>

<style scoped>
.rounded-circle {
  border-radius: 50%;
}
.text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
