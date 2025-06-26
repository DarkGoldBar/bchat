<template>
  <v-container class="pa-4">
    <h2>游戏房间{{ roomId }}</h2>

    <!-- 场景切换 -->
    <div v-if="stage === 'lobby'">
      <v-row>
        <LobbyView :roomId="roomId" :memberLimit="2" :me="me" :members="members"
          @set-position="(pos) => send({ action: 'lobby', subAction: 'changePosition', position: pos })"
          @change-self="(me) => send({ action: 'lobby', subAction:'changeSelf', me: me })" />
      </v-row>

      <v-row>
        <v-btn color="primary" @click="send({ type: 'start-game' })">开始游戏</v-btn>
        <v-btn color="secondary" @click="send({ type: 'change-rule' })">修改规则</v-btn>
      </v-row>
    </div>

    <div v-else-if="stage === 'ingame'">
      <h3>游戏进行中...</h3>
      <!-- 游戏进行中的内容 -->
      <p>这里可以放置游戏棋盘等内容。</p>
    </div>

    <div v-else>
      <p>加载中或状态异常…</p>
    </div>
  </v-container>
</template>

<script setup>
/** @typedef {import('@/types.js').User} User */
/** @typedef {import('@/types.js').Room} Room */
/** @typedef {import('vue').Ref} Ref */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LobbyView from '@/views/LobbyView.vue'
import { useWebSocket } from '@/composables/useWebSocket'

// 状态管理
const route = useRoute()
const roomId = ref(route.query.room || '')
/** @type {Ref<User, User>} */
const me = ref({}) // 当前用户信息
const stage = ref('lobby') // 'lobby' | 'ingame' | 'gameover'
const members = ref([]) // 房间成员列表
const { connect, send } = useWebSocket(roomId, me, {
  onMessage(data) {
    // 处理服务器消息
    const action = data.action;
    switch (action) {
      case "init":
        onMessageInit(data)
        break;
    }
    console.log('收到消息:', data)
  }
})

onMounted(() => {
  me.value = getLocalUser()
  connect()
})

/**
 * @param {Object} data 
 * @param {Room} data.room
 */
function onMessageInit(data) {
  // 更新房间状态
  if (data.room) {
    // 更新游戏阶段
    stage.value = data.room.stage || 'lobby'

    // 更新成员列表
    if (data.room.members) {
      members.value = data.room.members

      // 更新自己的信息（包括位置等）
      const selfMember = members.value.find(m => m.uuid === me.value.uuid)
      if (selfMember) {
        me.value = {
          ...me.value,
          ...selfMember
        }
      }
    }
  }
}

function setLocalUser({ uuid, name, avatar }) {
  localStorage.setItem('uuid', uuid)
  localStorage.setItem('name', name)
  localStorage.setItem('avatar', JSON.stringify(avatar))
}

function getLocalUser() {
  let uuid = localStorage.getItem('uuid')
  let name = localStorage.getItem('name')
  let avatarStr = localStorage.getItem('avatar')

  if (!uuid) uuid = crypto.randomUUID()
  if (!name) name = uuid.slice(-4)
  if (!avatarStr) avatarStr = '{"icon":"mdi-account","color":"primary"}'

  const avatar = JSON.parse(avatarStr)

  // 写回 localStorage（无论是不是默认值）
  setLocalUser({ uuid, name, avatar })

  return {
    uuid,
    name,
    avatar,
    position: 0,
    connectId: null // 连接ID可以在后端生成
  }
}
</script>
