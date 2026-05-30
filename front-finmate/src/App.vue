<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()

  onMounted(() => {
    authStore.initialize()
  })
</script>
