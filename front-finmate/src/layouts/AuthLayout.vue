<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-app-bar-title>FinMate</v-app-bar-title>

      <v-spacer />

      <span class="mr-2 text-body-medium">{{ auth.user?.name }}</span>

      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme.global.name.value === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>

      <v-btn icon="mdi-logout" @click="auth.logout" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :to="{ name: 'Dashboard' }"
        />

        <v-list-item
          disabled
          prepend-icon="mdi-shape"
          title="Categorías"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted, shallowRef } from 'vue'
  import { useTheme } from 'vuetify'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
  const theme = useTheme()
  const drawer = shallowRef(false)

  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      theme.global.name.value = saved
    }
  })

  function toggleTheme () {
    const next = theme.global.name.value === 'light' ? 'dark' : 'light'
    theme.global.name.value = next
    localStorage.setItem('theme', next)
  }
</script>
