<template>
  <div class="fm-auth-root">
    <div class="fm-panel-left">
      <div class="fm-panel-bg fm-panel-bg--register" />

      <div class="fm-panel-content">
        <router-link class="fm-logo" :to="{ name: 'Landing' }">
          <div class="fm-logo-icon">
            <v-icon color="white" size="20">mdi-finance</v-icon>
          </div>
          FinMate
        </router-link>

        <div class="fm-panel-body fm-panel-body--register">
          <h2 class="fm-panel-headline">
            Nueva<br />
            <em>contraseña.</em>
          </h2>

          <p class="fm-panel-sub fm-panel-sub--register">
            Elige una contraseña segura que no hayas usado antes.
          </p>
        </div>

        <div class="fm-deco-card">
          <div class="fm-deco-chip">
            <span class="fm-deco-dot" />
            Consejo
          </div>

          <div class="fm-panel-sub" style="font-size: 13px; color: var(--white-65)">
            Usa al menos 8 caracteres, incluye may&uacute;sculas, n&uacute;meros y un s&iacute;mbolo.
          </div>
        </div>
      </div>
    </div>

    <div class="fm-panel-right">
      <div class="fm-form-wrapper">
        <div class="fm-form-header">
          <h1 class="fm-form-title">Restablecer contrase&ntilde;a</h1>
          <p class="fm-form-sub">Ingresa tu nueva contraseña</p>
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

        <v-alert
          v-if="success"
          class="mb-5"
          closable
          density="compact"
          rounded="lg"
          type="success"
          variant="tonal"
          @click:close="success = ''"
        >
          {{ success }}
        </v-alert>

        <v-form v-if="!success" class="fm-form" @submit.prevent="handleResetPassword">
          <div class="fm-field-group">
            <label class="fm-label" for="reset-password">Nueva contraseña</label>

            <v-text-field
              id="reset-password"
              v-model="password"
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrors.newPassword ? [fieldErrors.newPassword] : []"
              hide-details="auto"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline"
              required
              rounded="lg"
              type="password"
              variant="outlined"
              @update:model-value="fieldErrors.newPassword = ''"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="reset-confirm">Confirmar contraseña</label>

            <v-text-field
              id="reset-confirm"
              v-model="confirmPassword"
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrors.confirmPassword ? [fieldErrors.confirmPassword] : []"
              hide-details="auto"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-check-outline"
              required
              rounded="lg"
              type="password"
              variant="outlined"
              @update:model-value="fieldErrors.confirmPassword = ''"
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
            Restablecer contraseña
          </v-btn>
        </v-form>

        <p class="fm-switch-link">
          <router-link :to="{ name: 'Login' }">Volver al inicio de sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosError } from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { resetPasswordSchema } from '@/validation';
import '@/styles/unauth.css';

const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');
const fieldErrors = ref<Record<string, string>>({});

const token = ref('');

onMounted(() => {
  token.value = new URLSearchParams(window.location.search).get('token') ?? '';
});

async function handleResetPassword() {
  if (!token.value) {
    error.value = 'Token inválido';
    return;
  }
  const result = resetPasswordSchema.safeParse({
    token: token.value,
    newPassword: password.value,
    confirmPassword: confirmPassword.value,
  });
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
    const res = await api.post('/auth/reset-password', {
      token: result.data.token,
      newPassword: result.data.newPassword,
    });
    success.value = res.data.message as string;
    setTimeout(() => router.push({ name: 'Login' }), 3000);
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message;
    error.value = msg || 'Error al restablecer la contraseña';
  } finally {
    loading.value = false;
  }
}
</script>
