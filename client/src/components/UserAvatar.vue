<script setup>
import { computed } from 'vue'

const props = defineProps({
  avatar: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: '64',
  },
  color: {
    type: String,
    default: '',
  },
})

const hasValidIcon = computed(() => {
  const iconName = props.avatar.icon
  return !!(iconName && iconName.startsWith('mdi-'))
})
</script>

<style scoped>
.me {
  border: 2px solid green;
  border-radius: 1000px;
}
</style>

<template>
  <v-avatar :color="avatar.color" size="size">
    <template v-if="hasValidIcon">
      <v-icon :icon="avatar.icon" :color="color"/>
    </template>
    <template v-else>
      <span class="text-h5">{{ avatar.text }}</span>
    </template>
  </v-avatar>
</template>
