<script setup>
/** @typedef {import('../types.js').Room} Room */
/** @typedef {import('../types.js').User} User */
import UserAvatar from '../components/UserAvatar.vue'
import { computed, ref } from 'vue'

defineEmits(['startGame', 'setRule']);

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

const posLimit = computed(() => props.room.posLimit)
const posZero = computed(() => props.room.members.filter((m) => m.position === 0))
const posMap = computed(() => Array
  .from({ length: posLimit.value + 1 })
  .map((_, i) => (i > 0 ? props.room.members.find(m => m.position === i) : null)))


// 编辑框
const editDialog = ref(false)
const editName = ref(props.me.name)
const editIcon = ref(props.me.avatar.icon)
const editColor = ref(props.me.avatar.color)

function handlePositionClick(position) {
  if (!posMap.value[position]) {
    props.send({
      route: 'lobby',
      action: 'setPosition',
      position
    })
  }
}

function confirmEdit() {
  editDialog.value = false
  props.send({
    route: 'lobby',
    action: 'setSelf',
    me: {
      ...props.me,
      name: editName.value,
      avatar: {
        icon: editIcon.value,
        color: editColor.value
      }
    }
  })
}
</script>

<template>
  <v-row justify="center" class="text-center">
    <v-col>
      <h2>游戏房间{{ room.id }}</h2>
    </v-col>
  </v-row>
  <v-row justify="center">
    <v-col cols="4">
      <v-btn class="mx-auto" color="primary" @click="$emit('startGame')">开始游戏</v-btn>
    </v-col>
    <v-col cols="4">
      <v-btn disabled color="secondary" @click="$emit('setRule')">修改规则</v-btn>
    </v-col>
    <v-col cols="4">
      <v-btn color="secondary" @click="editDialog = true">修改头像</v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <h3 class="mb-2">位置选择</h3>

      <!-- 旁观位 -->
      <v-row justify="center">
        <v-col cols="10">
          <v-card class="pa-1 mb-3" @click="handlePositionClick(0)">
            <v-card-subtitle>旁观</v-card-subtitle>
            <v-card-text class="d-flex align-center justify-space-around">
              <UserAvatar v-for="(user) in posZero" :avatar="user.avatar" :class="{ 'me': isme(user) }" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 位置格子区域 -->
      <v-row justify="center">
        <v-col v-for="pos in posLimit" :key="pos">
          <v-card outlined @click="handlePositionClick(pos)">
            <v-card-subtitle> 位置 {{ pos }} </v-card-subtitle>
            <v-card-text>
              <div v-if="posMap[pos]">
                <UserAvatar :avatar="posMap[pos].avatar" :class="{ 'me': isme(posMap[pos]) }" />
                <div>{{ posMap[pos].name }}</div>
              </div>
              <div v-else>空位</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>


  <!-- 编辑弹窗 -->
  <v-dialog v-model="editDialog" max-width="400">
    <v-card>
      <v-card-title>修改昵称与头像</v-card-title>
      <v-card-text>
        <v-text-field v-model="editName" label="昵称" />
        <v-text-field v-model="editIcon" label="头像符号" />
        <v-text-field v-model="editColor" label="头像颜色" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="confirmEdit">确认</v-btn>
        <v-btn text @click="editDialog = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
