<script setup>
/** @typedef {import('@bchat/types').User} User */
import { computed } from 'vue'

/** @type {{ user: Readonly<User> }} */
const props = defineProps({
  user: {
    type: Object,
    default: {},
  },
})

const hasValidIcon = computed(() => {
  const iconName = props.user.avatar.icon
  return !!(iconName && iconName.startsWith('mdi-'))
})

const isOnline = computed(() => !!props.user.connectId)
</script>

<style scoped>
.me {
  border: 2px solid green;
  border-radius: 1000px;
}
</style>

<template >
  <v-avatar v-if="isOnline">
    <template v-if="hasValidIcon">
      <v-icon :icon="props.user.avatar.icon" :color="props.user.avatar.color"/>
    </template>
    <template v-else>
      <span class="text-h5">{{ props.user.name }}</span>
    </template>
  </v-avatar>
  <v-avatar v-else>
    <v-icon icon="mdi-link-off" color="#888888"/>
  </v-avatar>
</template>
