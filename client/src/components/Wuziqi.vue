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

const state = computed(() => JSON.parse(props.room.body))

function handleMove(row, col) {
  const game = new Wuziqi(state.value)
  if (game.current !== props.me.position) {
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
  <v-container fluid class="pa-4">
    <!-- 状态栏 -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="5" class="text-center">
        <UserAvatar :avatar="playerA.avatar" />
        <div class="text-subtitle-1">{{ playerA.name }}</div>
      </v-col>
      <v-col cols="2" class="text-center">
        <v-chip color="primary" variant="flat">轮到</v-chip>
        <p>{{ currentTurn === 'A' ? playerA.name : playerB.name }}</p>
      </v-col>
      <v-col cols="5" class="text-center">
        <UserAvatar :avatar="playerB.avatar" />
        <div class="text-subtitle-1">{{ playerB.name }}</div>
      </v-col>
    </v-row>

    <!-- 棋盘区域 -->
    <v-card class="mb-4" elevation="2" height="550px" align="center">
      <svg id="board" width="500" height="500" viewBox="0 0 500 500">
        <!-- 网格线 -->
        <g stroke="#000">
          <line v-for="i in rows" :key="'h' + i" :x1="cellSize / 2" :x2="cellSize * (cols - 0.5)"
            :y1="cellSize * (i - 0.5)" :y2="cellSize * (i - 0.5)" />
          <line v-for="j in cols" :key="'v' + j" :y1="cellSize / 2" :y2="cellSize * (rows - 0.5)"
            :x1="cellSize * (j - 0.5)" :x2="cellSize * (j - 0.5)" />
        </g>

        <!-- 棋子 -->
        <g>
          <circle v-for="cell in board" :key="`${cell.row},${cell.col}`" :cx="cell.col * cellSize + cellSize / 2"
            :cy="cell.row * cellSize + cellSize / 2" :r="cellSize * 0.35" class="cell"
            :class="{ 'cell-none': !cell.value , 'cell-A': cell.value === 'A', 'cell-B': cell.value === 'B'}"
            @click="() => !cell.value && handleMove(cell.row, cell.col)" />
        </g>
      </svg>
    </v-card>

    <!-- 控制区 -->
    <v-row justify="center" align="center" class="mt-2">
      <v-btn color="primary" class="mx-2" @click="handleUndo">悔棋</v-btn>
      <v-btn color="error" class="mx-2" @click="handleGiveUp">认输</v-btn>
    </v-row>
  </v-container>
</template>


<style scoped>
svg#board {
  margin: 18px;
  padding: 4px;
  border: 3px solid #888;
  background-color: #fef9e7;
}

svg#board[disabled] {
  pointer-events: none;
}

.cell {
  cursor: pointer;
  stroke-width: 2px;
  transition: fill 0.3s;
}

.cell-A {
  stroke: #000;
  cursor: default;
  fill: #000000;
}

.cell-B {
  stroke: #000;
  cursor: default;
  fill: #ffffff;
}

.cell-none {
  fill: transparent;
}

.cell-none:hover {
  stroke: #888;
}
</style>
