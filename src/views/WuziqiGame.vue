<script setup>
/** @typedef {import('../types.js').User} User */
/** @typedef {import('../types.js').Room} Room */

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LobbyView from '@/components/Lobby.vue'
import WuziqiView from '@/components/Wuziqi.vue'
import useWebSocket from '@/composables/useWebSocket'

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('error')

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
    setLocalUser(me.value)
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


function onChangeSelf() {
  setLocalUser(me)
  send({
    action: 'lobby',
    subAction: 'changeSelf',
    me: me.value
  })
}

function onChangePosition(position) {
  send({
    action: 'lobby',
    subAction: 'changePosition',
    position
  })
}

function onClickStart() {
  const isReady = room.value.members.filter(m => m.position > 0).length === room.value.posLimit
  if (!isReady) {
    snackbarMessage.value = '请所有位置占满后再开始游戏';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } else {
    send({
      action: 'wuziqi',
      subAction: 'startGame'
    })
  }
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
        <v-btn class="mx-auto" color="primary" @click="onClickStart">开始游戏</v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn disabled color="secondary" @click="send({ action: 'lobby', subAction: 'changeRule' })">修改规则</v-btn>
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
    <WuziqiView :room="room" :me="me" />
  </v-container>

  <v-container v-else>
    <WuziqiView :room="room" :me="me" />
  </v-container>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
