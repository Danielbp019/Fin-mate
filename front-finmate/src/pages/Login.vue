<template>
  <div class="fm-auth-root">
    <!-- Panel izquierdo decorativo -->
    <div class="fm-panel-left">
      <div class="fm-panel-bg" />

      <div class="fm-panel-content">
        <router-link class="fm-logo" :to="{ name: 'Landing' }">
          <div class="fm-logo-icon">
            <v-icon color="white" size="20">mdi-finance</v-icon>
          </div>
          FinMate
        </router-link>

        <div class="fm-panel-body">
          <h2 class="fm-panel-headline">
            Cada peso<br />
            <em>cuenta.</em>
          </h2>
          <p class="fm-panel-sub">
            Visualiza tus finanzas, elimina deudas y alcanza metas con tu pareja.
          </p>

          <div class="fm-stats-col">
            <div class="fm-stat-item">
              <span class="fm-stat-num">94%</span>
              <span class="fm-stat-label">reducen gastos en 3 meses</span>
            </div>
            <div class="fm-stat-divider" />
            <div class="fm-stat-item">
              <span class="fm-stat-num gold">$1.2M</span>
              <span class="fm-stat-label">en deudas gestionadas</span>
            </div>
          </div>
        </div>

        <!-- Tarjeta decorativa mini -->
        <div class="fm-deco-card">
          <div class="fm-deco-chip">
            <span class="fm-deco-dot" />
            Balance del mes
          </div>
          <div class="fm-deco-amount">$4,820</div>
          <div class="fm-deco-bar-track">
            <div class="fm-deco-bar-fill" />
          </div>
          <div class="fm-deco-bar-labels">
            <span>Gastos 68%</span>
            <span class="green">↑ Ahorro $820</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: formulario -->
    <div class="fm-panel-right">
      <div class="fm-form-wrapper">
        <div class="fm-form-header">
          <h1 class="fm-form-title">Bienvenido de vuelta</h1>
          <p class="fm-form-sub">Ingresa tus datos para continuar</p>
        </div>

        <v-alert
          v-if="error"
          class="fm-alert mb-5"
          closable
          density="compact"
          rounded="lg"
          type="error"
          variant="tonal"
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-form class="fm-form" @submit.prevent="handleLogin">
          <div class="fm-field-group">
            <label class="fm-label">Correo electrónico</label>
            <v-text-field
              v-model="email"
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              placeholder="tu@correo.com"
              prepend-inner-icon="mdi-email-outline"
              required
              rounded="lg"
              type="email"
              variant="outlined"
            />
          </div>

          <div class="fm-field-group">
            <div class="fm-label-row">
              <label class="fm-label">Contraseña</label>
              <a class="fm-forgot" href="#">¿La olvidaste?</a>
            </div>
            <v-text-field
              v-model="password"
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline"
              required
              rounded="lg"
              type="password"
              variant="outlined"
            />
          </div>

          <v-btn
            block
            class="fm-btn-submit mt-6"
            :loading="loading"
            rounded="lg"
            size="large"
            type="submit"
          >
            <template #loader>
              <v-progress-circular color="white" indeterminate size="20" width="2" />
            </template>
            Ingresar
          </v-btn>
        </v-form>

        <p class="fm-switch-link">
          ¿No tienes cuenta?
          <router-link :to="{ name: 'Register' }">Regístrate gratis</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AxiosError } from 'axios';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import '@/styles/theme.css';

const auth = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message;
    error.value = msg || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.fm-panel-bg::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(29, 158, 117, 0.25);
  bottom: -200px;
  right: -150px;
}

.fm-panel-bg::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  top: -60px;
  left: -80px;
}
</style>
