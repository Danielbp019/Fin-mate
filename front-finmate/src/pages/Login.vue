<template>
  <div class="fm-auth-root">
    <!-- Panel izquierdo decorativo -->
    <div class="fm-panel-left">
      <div class="fm-panel-bg fm-panel-bg--login" />

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
            <label class="fm-label" for="login-email">Correo electrónico</label>

            <v-text-field
              id="login-email"
              v-model="email"
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrors.email ? [fieldErrors.email] : []"
              hide-details="auto"
              placeholder="tu@correo.com"
              prepend-inner-icon="mdi-email-outline"
              required
              rounded="lg"
              type="email"
              variant="outlined"
              @update:model-value="fieldErrors.email = ''"
            />
          </div>

          <div class="fm-field-group">
            <div class="fm-label-row">
              <label class="fm-label" for="login-password">Contraseña</label>
              <router-link class="fm-forgot" :to="{ name: 'ForgotPassword' }">¿La olvidaste?</router-link>
            </div>

            <v-text-field
              id="login-password"
              v-model="password"
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrors.password ? [fieldErrors.password] : []"
              hide-details="auto"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline"
              required
              rounded="lg"
              type="password"
              variant="outlined"
              @update:model-value="fieldErrors.password = ''"
            />
          </div>

          <v-btn
            block
            class="fm-btn-submit mt-8"
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
/** Login — página de inicio de sesión con formulario email/contraseña. Usado en ruta '/login' */
import type { AxiosError } from 'axios';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { loginSchema } from '@/validation';
import '@/styles/unauth.css';

const auth = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const fieldErrors = ref<Record<string, string>>({});

async function handleLogin() {
  const result = loginSchema.safeParse({ email: email.value, password: password.value });
  if (!result.success) {
    fieldErrors.value = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fieldErrors.value[field] = issue.message;
    }
    return;
  }
  loading.value = true;
  error.value = '';
  fieldErrors.value = {};
  try {
    await auth.login(result.data.email, result.data.password);
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message;
    error.value = msg || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
}
</script>
