<script setup>
/** @typedef {import('@/types.js').User} User */
/** @typedef {import('@/types.js').Room} Room */

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LobbyView from '@/components/Lobby.vue'
import useWebSocket from '@/composables/useWebSocket'

// 状态管理
const route = useRoute()
/** @type {import('vue').Ref<User>} */
const me = ref({})
/** @type {import('vue').Ref<Room>} */
const room = ref({})
room.value.id = route.query.room || ''

const { connect, send } = useWebSocket(room.value.id, me, {
  onMessage(data) {
    console.log('收到消息:', data)
    const action = data.action;
    switch (action) {
      case 'init':
        onMessageInit(data)
        break
      case 'userChangedPosition':
        onMessagePosChange(data)
        break
    }
  }
})

onMounted(() => {
  me.value = getLocalUser()
  connect()
})

/**
 * @param {Object} data 
 * @param {Room} 
 */
function onMessageInit(data) {
  if (data.room) {
    room.value = data.room
    me.value = data.room.members.find(m => m.uuid === me.value.uuid)
  }
}

/** @param {{ user: User }} data  */
function onMessagePosChange(data) {
  const mem = room.value.members.find(m => m.uuid === data.user.uuid)
  mem.position = data.user.position;
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
  let avatar = {}

  if (!uuid || uuid === 'undefined') uuid = crypto.randomUUID()
  if (!name || name === 'undefined') name = uuid.slice(-4)
  if (!avatarStr || avatarStr === 'undefined') avatarStr = '{"icon":"mdi-account","color":"#42a5f5"}'

  avatar = JSON.parse(avatarStr)

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

function onChangePosition(position) {
  send({
    action: 'lobby',
    subAction: 'changePosition',
    position
  })
}
</script>

<template>
  <v-container v-if="room.stage === 'lobby'">
    <v-row justify="center" class="text-center">
      <v-col>
        <h2>游戏房间{{ room.id }}</h2>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="4">
        <v-btn class="mx-auto" color="primary" @click="send({ type: 'start-game' })">开始游戏</v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn color="secondary" @click="send({ type: 'change-rule' })">修改规则</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <LobbyView :roomId="room.id" :posLimit="room.posLimit" :me="me" :members="room.members"
          @set-position="onChangePosition" @change-self="onChangeSelf" />
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else-if="room.stage === 'ingame'">
    <h3>游戏进行中</h3>
    <!-- 游戏进行中的内容 -->
    <p>这里可以放置游戏棋盘等内容。</p>
  </v-container>

  <v-container v-else>
    <p>加载中</p>
  </v-container>
</template>
