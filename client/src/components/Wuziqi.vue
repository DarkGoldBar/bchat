<script setup>
/** @typedef {import('../types.js').Room} Room */
/** @typedef {import('../types.js').User} User */

import UserAvatar from '../components/UserAvatar.vue'
import { computed, inject } from 'vue'

import { Wuziqi } from '@bchat/shared';

const snackbarCall = inject('snackbarCall')

/**
 * @type {{
    readonly room: Room;
    readonly me: User;
    readonly send: (data: unknown)=>void;
  }}
 */
const props = defineProps({
  room: {
    type: Object,
    required: true
  },
  me: {
    type: Object,
    required: true
  },
  send: {
    type: Function,
    required: true
  }
})

const isme = (user) => (user.uuid === props.me.uuid)

/** @type {import('vue').ComputedRef<WuziqiState>} */
const state = computed(() => JSON.parse(props.room.body))
const player1 = computed(() => props.room.members.find(m => m.position === 1) || {})
const player2 = computed(() => props.room.members.find(m => m.position === 2) || {})
const cellSize = computed(() => 500 / Math.max(state.value.rows, state.value.cols))
const rows = computed(() => state.value.rows)
const cols = computed(() => state.value.cols)
const board = computed(() => state.value.board || [])
const winner = computed(() => state.value.winner ? props.room.members.find(m => m.position === state.value.winner) : null)
const me = computed(() => props.room.members.find(m => isme(m)))

function handleMove(row, col) {
  const game = new Wuziqi(state.value)
  if (game.current !== me.value.position) {
    snackbarCall('不是你的回合', 'error')
    return
  }
  if (!game.canMove(row, col)) {
    snackbarCall('无法落子', 'error')
    return
  }
  props.send({
    route: 'wuziqi',
    action: 'move',
    row,
    col
  })
}

function handleUndo() {
  const game = new Wuziqi(state.value)
  if (game.current !== props.me.position) {
    snackbarCall('不是你的回合', 'error')
    return
  }
  if (!game.canUndo()) {
    snackbarCall('无法悔棋 ', 'error')
    return
  }
  props.send({
    route: 'wuziqi',
    action: 'undo'
  })
}

function handleGiveUp() {
  props.send({
    route: 'wuziqi',
    action: 'giveup'
  })
}

</script>

<template>
  <v-container fluid class="pa-4 d-flex flex-column">
    <!-- 状态栏 -->
    <v-row align="center" justify="space-between" class="flex-0-0-0">
      <v-col class="text-center">
        <UserAvatar :avatar="player1.avatar" :class="{ 'me': isme(player1) }" />
        <div class="text-subtitle-1">{{ player1.name }}</div>
      </v-col>
      <v-col v-if="winner" class="text-center">
        <v-chip color="success" variant="flat">赢家</v-chip>
        <p>{{ winner.name }}</p>
      </v-col>
      <v-col v-else class="text-center">
        <v-chip color="primary" variant="flat">轮到</v-chip>
        <p>{{ state.current === 1 ? player1.name : player2.name }}</p>
      </v-col>
      <v-col class="text-center">
        <UserAvatar :avatar="player2.avatar" :class="{ 'me': isme(player2) }" />
        <div class="text-subtitle-1">{{ player2.name }}</div>
      </v-col>
    </v-row>

    <!-- 棋盘区域 -->
    <v-card align="center" elevation="2" class="flex-1-1-100">
      <svg id="board" viewBox="0 0 500 500">
        <!-- 网格线 -->
        <g stroke="#000">
          <line v-for="i in rows" :key="'h' + i" :x1="cellSize / 2" :x2="cellSize * (cols - 0.5)"
            :y1="cellSize * (i - 0.5)" :y2="cellSize * (i - 0.5)" />
          <line v-for="j in cols" :key="'v' + j" :y1="cellSize / 2" :y2="cellSize * (rows - 0.5)"
            :x1="cellSize * (j - 0.5)" :x2="cellSize * (j - 0.5)" />
        </g>

        <!-- 棋子 -->
        <g>
          <circle v-for="(cell, index) in board" :key="index" :cx="(index % cols) * cellSize + cellSize / 2"
            :cy="Math.floor(index / cols) * cellSize + cellSize / 2" :r="cellSize * 0.35" class="cell" :class="{
              'cell-0': cell === 0,
              'cell-1': cell === 1,
              'cell-2': cell === 2,
            }" @click="() => !cell && handleMove(Math.floor(index / cols), index % cols)" />

        </g>
      </svg>
    </v-card>

    <!-- 控制区 -->
    <v-row justify="center" align="center" class="flex-0-0-0 mt-2">
      <v-btn color="primary" class="ma-2" @click="handleUndo">悔棋</v-btn>
      <v-btn color="error" class="ma-2" @click="handleGiveUp">认输</v-btn>
    </v-row>
  </v-container>
</template>


<style scoped>
svg#board {
  margin: 18px;
  padding: 4px;
  border: 3px solid #888;
  background-color: #fef9e7;
  max-height: 500px;
}

svg#board[disabled] {
  pointer-events: none;
}

.cell {
  cursor: pointer;
  stroke-width: 2px;
  transition: fill 0.3s;
}

.cell-1 {
  stroke: #000;
  cursor: default;
  fill: #000000;
}

.cell-2 {
  stroke: #000;
  cursor: default;
  fill: #ffffff;
}

.cell-0 {
  fill: transparent;
}

.cell-0:hover {
  stroke: #888;
}
</style>
