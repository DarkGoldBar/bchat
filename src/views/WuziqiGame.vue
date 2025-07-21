<script setup>
/** @typedef {import('../types.js').User} User */
/** @typedef {import('../types.js').Room} Room */

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LobbyView from '../components/LobbyView.vue'
import useWebSocket from '../composables/useWebSocket'

// 状态管理
const route = useRoute()
/** @type {import('vue').Ref<User>} */
const me = ref({})
/** @type {import('vue').Ref<Room>} */
const room = ref({})
room.value.id = route.query.room || ''

const { connect, send } = useWebSocket(room.value.id, me, {
  onMessage(data) {
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
  if (data.room) {
    room.value = data.room
    me.value = data.room.members.find(m => m.uuid === me.value.uuid)
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

  setLocalUser({ uuid, name, avatar })

  return {
    uuid,
    name,
    avatar,
    position: 0,
    connectId: null
  }
}

function onChangeSelf(name, icon, color) {
  me.value.name = name
  me.value.avatar.icon = icon
  me.value.avatar.color = color
  setLocalUser(me)
  send({
    action: 'lobby',
    subAction: 'changeSelf',
    me
  })
}

function onChangePosition(pos) {
  send({
    action: 'lobby',
    subAction: 'changePosition',
    pos
  })
}
</script>

<template>
  <v-container class="pa-4">
    <h2>游戏房间{{ room.id }}</h2>

    <!-- 场景切换 -->
    <div v-if="stage === 'lobby'">
      <v-row>
        <LobbyView :roomId="room.id" :posLimit="room.posLimit" :me="me" :members="room.members"
          @set-position="onChangePosition" @change-self="onChangeSelf" />
      </v-row>

      <v-row>
        <v-btn color="primary" @click="send({ type: 'start-game' })">开始游戏</v-btn>
        <v-btn color="secondary" @click="send({ type: 'change-rule' })">修改规则</v-btn>
      </v-row>
    </div>

    <div v-else-if="stage === 'ingame'">
      <h3>游戏进行中</h3>
      <!-- 游戏进行中的内容 -->
      <p>这里可以放置游戏棋盘等内容。</p>
    </div>

    <div v-else>
      <p>状态异常</p>
    </div>
  </v-container>
</template>
