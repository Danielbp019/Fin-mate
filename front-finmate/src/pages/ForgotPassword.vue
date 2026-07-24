<template>
  <div class="fm-auth-root">
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
            Recupera tu<br />
            <em>acceso.</em>
          </h2>

          <p class="fm-panel-sub">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div class="fm-deco-card">
          <div class="fm-deco-chip">
            <span class="fm-deco-dot" />
            Sin riesgos
          </div>

          <div class="fm-deco-amount" style="font-size: 22px">Tu informaci&oacute;n</div>

          <div class="fm-deco-bar-track">
            <div class="fm-deco-bar-fill" style="width: 100%" />
          </div>

          <div class="fm-deco-bar-labels">
            <span>Est&aacute; protegida</span>
            <span class="green">Cifrado SSL</span>
          </div>
        </div>
      </div>
    </div>

    <div class="fm-panel-right">
      <div class="fm-form-wrapper">
        <div class="fm-form-header">
          <h1 class="fm-form-title">Recuperar contrase&ntilde;a</h1>
          <p class="fm-form-sub">Ingresa tu correo y te enviaremos un enlace</p>
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

        <v-form v-if="!success" class="fm-form" @submit.prevent="handleForgotPassword">
          <div class="fm-field-group">
            <label class="fm-label" for="forgot-email">Correo electrónico</label>

            <v-text-field
              id="forgot-email"
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
            Enviar enlace
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
import { ref } from 'vue';
import api from '@/services/api';
import { forgotPasswordSchema } from '@/validation';
import '@/styles/unauth.css';

const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');
const fieldErrors = ref<Record<string, string>>({});

async function handleForgotPassword() {
  const result = forgotPasswordSchema.safeParse({ email: email.value });
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
    const res = await api.post('/auth/forgot-password', { email: result.data.email });
    success.value = res.data.message as string;
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message;
    error.value = msg || 'Error al enviar el enlace';
  } finally {
    loading.value = false;
  }
}
</script>
