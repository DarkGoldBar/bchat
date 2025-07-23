<script setup>
/** @typedef {import('../types.js').User} User */
import UserAvatar from '@/components/UserAvatar.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  roomId: String,
  posLimit: Number,
  members: Array,
  me: Object
})

const emit = defineEmits(['set-position', 'change-self'])

/** @type {Record<number, User>} */
const positionMap = computed(() => {
  const map = {}
  for (const user of props.members) {
    user.avatar.text = user.name[0] + user.name[1];
    if (user.position > 0) map[user.position] = user
  }
  return map
})

/** @type {User[]} */
const spectators = computed(() => props.members.filter((m) => m.position === 0))

// 编辑框
const editDialog = ref(false)
const editName = ref('')
const editIcon = ref('')
const editColor = ref('')


function handlePositionClick(position) {
  if (position === props.me.position) {
    editName.value = props.me.name
    editIcon.value = props.me.avatar.icon
    editColor.value = props.me.avatar.color
    editDialog.value = true
  } else if (!positionMap.value[position]) {
    emit('set-position', position)
  }
}


function confirmEdit() {
  props.me.name = editName.value
  props.me.avatar.icon = editIcon.value
  props.me.avatar.color = editColor.value
  editDialog.value = false
  emit('change-self')
}

function isme(user) {
  return user.uuid === props.me.uuid
}
</script>

<template>
  <h3 class="mb-2">位置选择</h3>

  <!-- 旁观位 -->
  <v-row justify="center">
    <v-col cols="10">
      <v-card class="pa-1 mb-3" @click="handlePositionClick(0)">
        <v-card-title>旁观</v-card-title>
        <v-card-text class="d-flex align-center justify-space-around">
          <UserAvatar v-for="(user) in spectators" :avatar="user.avatar" :color="isme(user) ? 'black' : ''"/>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  
  <!-- 位置格子区域 -->
  <v-row justify="center">
    <v-col v-for="pos in posLimit" :key="pos">
      <v-card outlined @click="handlePositionClick(pos)">
        <v-card-title> 位置 {{ pos }} </v-card-title>
        <v-card-text>
          <div v-if="positionMap[pos]">
            <UserAvatar :avatar="positionMap[pos].avatar" :color="isme(positionMap[pos]) ? 'black' : ''"/>
            <div>{{ positionMap[pos].name }}</div>
          </div>
          <div v-else>空位</div>
        </v-card-text>
      </v-card>
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
