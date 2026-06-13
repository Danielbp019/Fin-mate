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
        <router-link
          style="text-decoration: none; color: inherit; cursor: pointer"
          :to="{ name: 'Dashboard' }"
        >
          <div class="lp-logo">
            <div class="lp-logo-icon">
              <v-icon color="white" size="20">mdi-finance</v-icon>
            </div>
            FinMate
          </div>
        </router-link>
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

          <v-btn class="fm-btn-submit" :loading="loggingOut" @click="handleLogout">
            <v-icon>mdi-logout</v-icon> Salir
            <template #loader>
              <v-progress-circular color="white" indeterminate size="20" width="2" />
            </template>
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" class="fm-drawer">
      <v-list>
        <v-list-item prepend-icon="mdi-shape" title="Categorías" :to="{ name: 'Categories' }" />

        <v-list-item
          exact
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :to="{ name: 'Dashboard' }"
        />

        <v-list-item
          prepend-icon="mdi-credit-card-clock-outline"
          title="Deudas"
          :to="{ name: 'Debts' }"
        />

        <v-list-item
          prepend-icon="mdi-swap-horizontal-bold"
          title="Movimientos"
          :to="{ name: 'Movements' }"
        />

        <v-list-item prepend-icon="mdi-account-heart" title="Pareja" :to="{ name: 'Couples' }" />

        <v-list-item prepend-icon="mdi-account" title="Perfil" :to="{ name: 'Profile' }" />
      </v-list>

      <template #append>
        <div class="fm-drawer-footer">
          <div class="fm-drawer-footer-label">Creado por:</div>
          <img alt="Firma Daniel" class="fm-drawer-signature" :src="firmaSrc" />
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, shallowRef } from 'vue';
import { useTheme } from 'vuetify';
import firmaBlack from '@/assets/daniel_firma_black.svg';
import firmaWhite from '@/assets/daniel_firma_white.svg';
import { useAuthStore } from '@/stores/auth';
import '@/styles/theme.css';

const auth = useAuthStore();
const theme = useTheme();
const drawer = shallowRef(true);

const firmaSrc = computed(() => (theme.global.name.value === 'light' ? firmaBlack : firmaWhite));

const loggingOut = ref(false);

async function handleLogout() {
  loggingOut.value = true;
  try {
    await auth.logout();
  } finally {
    loggingOut.value = false;
  }
}

onMounted(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    theme.change(saved);
  }
});

function toggleTheme() {
  const next = theme.global.name.value === 'light' ? 'dark' : 'light';
  theme.change(next);
  localStorage.setItem('theme', next);
}
</script>
