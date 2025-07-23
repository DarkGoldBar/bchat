<script setup>
import { computed } from 'vue'

const props = defineProps({
  avatar: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: '40',
  } 
})

const hasValidIcon = computed(() => {
  const iconName = props.avatar.icon
  return !!(iconName && iconName.startsWith('mdi-'))
})
</script>

<template>
  <v-avatar :color="avatar.color" size="size">
    <template v-if="hasValidIcon">
      <v-icon :icon="avatar.icon" />
    </template>
    <template v-else>
      <span class="text-h5">{{ avatar.text }}</span>
    </template>
  </v-avatar>
</template>
