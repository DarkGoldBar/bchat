<script setup>
/** @typedef {import('../types.js').User} User */
/** @typedef {import('../types.js').Room} Room */

import { ref, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LobbyView from '../components/Lobby.vue'
import WuziqiView from '../components/Wuziqi.vue'
import useComm from '../composables/useComm'

const snackbarCall = inject('snackbarCall')
const route = useRoute()
const comm = useComm(route.query.roomId)
const room = ref(comm.room)
const me = comm.me
const send = comm.send

onMounted(() => {
  comm.connect()
})

function onClickStart() {
  console.log("start")
}

function onClickChangeRule() {
  console.log("changeRule")
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
        <v-btn disabled color="secondary" @click="onClickChangeRule">修改规则</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <LobbyView :room :me :send />
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else-if="room.stage === 'ingame'">
    <WuziqiView :room :me :send />
  </v-container>

  <v-container v-else>
    {{ 加载中 }}
  </v-container>

</template>
