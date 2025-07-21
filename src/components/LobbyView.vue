
<script setup>
/** @typedef {import('@/types.js').User} User */

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
    if (user.position > 0) map[user.position] = user
  }
  return map
})

/** @type {User[]} */
const spectators = computed(() => props.members.filter((m) => m.position === 0))

function isMe(user) {
  return props.me && user.uuid === props.me.uuid
}

function handlePositionClick(pos) {
  const user = positionMap.value[pos]
  if (user && isMe(user)) {
    // 点击自己，弹出修改框
    editName.value = props.me.name
    editAvatar.value = props.me.avatar
    editDialog.value = true
  } else if (!user) {
    emit('set-position', pos)
  }
}

// 编辑框
const editDialog = ref(false)
const editName = ref('')
const editIcon = ref('')
const editColor = ref('')

function confirmEdit() {
  emit('change-self', {
    name: editName.value,
    icon: editIcon.value,
    color: editColor.value
  })
  editDialog.value = false
}
</script>

<template>
  <div>
    <h3 class="mb-2">房间等待界面（{{ roomId }}）</h3>

    <!-- 位置格子区域 -->
    <v-row class="mb-4" justify="center">
      <v-col v-for="pos in memberLimit" :key="pos" cols="4" class="text-center">
        <v-card outlined class="pa-3" @click="handlePositionClick(pos)">
          <div v-if="positionMap[pos]">
            <v-avatar size="48" class="mx-auto mb-1">
              <v-img :src="positionMap[pos].avatar" />
            </v-avatar>
            <div>{{ positionMap[pos].name }}</div>
            <div v-if="isMe(positionMap[pos])">(你)</div>
          </div>
          <div v-else>空位（{{ pos }}）</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 观众区域 -->
    <v-card class="pa-2 mb-3" @click="emit('set-position', 0)">
      <div class="text-subtitle-2 mb-1">观众区（点击加入）</div>
      <v-row>
        <v-avatar v-for="(user, index) in spectators" :key="index" :color="user.color" size="40" class="mx-1">
          <v-img v-if="user.img" :src="user.img"></v-img>
          <v-icon v-if="user.icon" :icon="user.icon"></v-icon>
          <span v-else>{{ user.text }}</span>
        </v-avatar>
      </v-row>
    </v-card>

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
  </div>
</template>
