<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
import { ref, reactive } from 'vue'

// 玩家数据
const playerA = {
  name: 'Alice',
  avatar: {
    icon: 'mdi-ghost',
    text: 'A',
    color: 'primary',
  },
}
const playerB = {
  name: 'Bob',
  avatar: {
    icon: 'mdi-axe',
    text: 'B',
    color: 'secondary',
  },
}

const currentTurn = ref('A') // 当前回合玩家
const rows = 11
const cols = 11
const cellSize = 500 / Math.max(rows, cols)

/** @typedef {Object} Cell
 * @property {'' | 'A' | 'B'} value
 * @property {number} row
 * @property {number} col
 */

/** @type {import ('vue').Reactive<Cell[]>} */
const board = reactive(Array.from({ length: rows * cols }).map((_, index) => ({
  value: '',
  row: Math.floor(index / cols),
  col: index % cols,
})))
board[0].value = 'A' // 初始位置示例
board[1].value = 'B' // 初始位置示例

// 落子逻辑
function placePiece(pos) {
  if (board[pos]) return
  board[pos] = currentTurn.value
  currentTurn.value = currentTurn.value === 'A' ? 'B' : 'A'
}

function handleUndo() {
  console.log('悔棋')
}
function handleGiveUp() {
  console.log('认输')
}

</script>

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
            @click="() => !cell.value && placePiece(cell.row, cell.col)" />
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
