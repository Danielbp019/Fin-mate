<template>
  <v-app>
    <v-app-bar class="auth-nav-bar" elevation="0" flat>
      <template #prepend>
        <v-btn
          aria-label="Abrir menú"
          icon
          style="color: var(--green-deep)"
          variant="text"
          @click="drawer = !drawer"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>

      <v-app-bar-title>
        <div class="lp-logo">
          <div class="lp-logo-icon">
            <v-icon color="white" size="20">mdi-finance</v-icon>
          </div>
          FinMate
        </div>
      </v-app-bar-title>

      <template #append>
        <div class="d-flex align-center ga-3">
          <span style="color: var(--green-deep); font-size: 14px; font-weight: 500"
            >Bienvenido, {{ auth.user?.name }}</span
          >

          <button
            :aria-label="`Cambiar tema a ${theme.global.name.value === 'light' ? 'oscuro' : 'claro'}`"
            class="btn-ghost"
            @click="toggleTheme"
          >
            <v-icon>{{
              theme.global.name.value === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'
            }}</v-icon>
          </button>

          <button class="btn-primary" @click="auth.logout">
            <v-icon>mdi-logout</v-icon> Salir
          </button>
        </div>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :to="{ name: 'Dashboard' }"
        />

        <v-list-item prepend-icon="mdi-account" title="Perfil" :to="{ name: 'Profile' }" />

        <v-list-item prepend-icon="mdi-shape" title="Categorías" :to="{ name: 'Categories' }" />

        <v-list-item
          prepend-icon="mdi-swap-horizontal-bold"
          title="Movimientos"
          :to="{ name: 'Movements' }"
        />

        <v-list-item
          prepend-icon="mdi-credit-card-clock-outline"
          title="Deudas"
          :to="{ name: 'Debts' }"
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
import { onMounted, shallowRef } from 'vue';
import { useTheme } from 'vuetify';
import { useAuthStore } from '@/stores/auth';
import '@/styles/theme.css';

const auth = useAuthStore();
const theme = useTheme();
const drawer = shallowRef(false);

onMounted(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    theme.global.name.value = saved;
  }
});

function toggleTheme() {
  const next = theme.global.name.value === 'light' ? 'dark' : 'light';
  theme.global.name.value = next;
  localStorage.setItem('theme', next);
}
</script>
