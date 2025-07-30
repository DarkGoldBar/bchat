<script setup>
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
  const isReady = room.value.members.filter(m => m.position > 0).length === room.value.posLimit
  if (isReady) {
    send({ route: "wuziqi", action: "start" })
  } else {
    snackbarCall('Can not start game', 'warning')
  }
}

function onClickSetRule() {
  console.log("setRule")
}
</script>

<template>
  <v-container v-if="room.stage === 'lobby'">
    <LobbyView :room :me :send @startGame="onClickStart" @setRule="onClickSetRule"/>
  </v-container>

  <v-container v-else-if="room.stage === 'ingame'">
    <WuziqiView :room :me :send />
  </v-container>

  <v-container v-else>
    加载中
  </v-container>
</template>
