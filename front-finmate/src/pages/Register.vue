<template>
  <div class="fm-auth-root">
    <!-- Panel izquierdo decorativo -->
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
            Empieza tu<br />
            camino a la<br />
            <em>libertad</em><br />
            financiera.
          </h2>

          <p class="fm-panel-sub fm-panel-sub--register">
            Crea tu cuenta gratis y toma el control de cada peso desde el primer día.
          </p>
        </div>

        <!-- Features list -->
        <div class="fm-features">
          <div class="fm-feature-item">
            <div class="fm-feature-icon">
              <v-icon color="white" size="16">mdi-check</v-icon>
            </div>

            <span>Control de ingresos y gastos</span>
          </div>

          <div class="fm-feature-item">
            <div class="fm-feature-icon">
              <v-icon color="white" size="16">mdi-check</v-icon>
            </div>

            <span>Estrategias para eliminar deudas</span>
          </div>

          <div class="fm-feature-item">
            <div class="fm-feature-icon">
              <v-icon color="white" size="16">mdi-check</v-icon>
            </div>

            <span>Modo pareja sincronizado</span>
          </div>

          <div class="fm-feature-item">
            <div class="fm-feature-icon">
              <v-icon color="white" size="16">mdi-check</v-icon>
            </div>

            <span>Completamente gratuito</span>
          </div>
        </div>

        <!-- Tarjeta decorativa mini -->
        <div class="fm-deco-card">
          <div class="fm-deco-header">
            <div class="fm-deco-chip">
              <span class="fm-deco-dot" />
              Modo pareja activo
            </div>

            <span class="fm-deco-badge">👫 Sincronizado</span>
          </div>

          <div class="fm-deco-pair">
            <div class="fm-deco-avatar" style="background: var(--gold)">A</div>

            <div class="fm-deco-avatar" style="background: var(--blue-mid); margin-left: -8px">
              M
            </div>

            <div class="fm-deco-pair-text">
              <span class="fm-deco-pair-name">Ana & Miguel</span>
              <span class="fm-deco-pair-sub">Meta compartida: $5,000</span>
            </div>
          </div>

          <div class="fm-deco-bar-track">
            <div class="fm-deco-bar-fill" style="width: 74%" />
          </div>

          <div class="fm-deco-bar-labels">
            <span>74% completado</span>
            <span class="gold">$3,700 ahorrados</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: formulario -->
    <div class="fm-panel-right">
      <div class="fm-form-wrapper">
        <div class="fm-form-header fm-form-header--register">
          <h1 class="fm-form-title">Crea tu cuenta</h1>
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

        <v-form class="fm-form" @submit.prevent="handleRegister">
          <div class="fm-field-group">
            <label class="fm-label" for="register-name">Nombre completo</label>

            <v-text-field
              id="register-name"
              v-model="name"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              placeholder="Tu nombre"
              prepend-inner-icon="mdi-account-outline"
              required
              rounded="lg"
              variant="outlined"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="register-email">Correo electrónico</label>

            <v-text-field
              id="register-email"
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

          <div class="fm-field-row">
            <div class="fm-field-group">
              <label class="fm-label" for="register-password">Contraseña</label>

              <v-text-field
                id="register-password"
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

            <div class="fm-field-group">
              <label class="fm-label" for="register-confirm">Confirmar contraseña</label>

              <v-text-field
                id="register-confirm"
                v-model="confirmPassword"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                placeholder="••••••••"
                prepend-inner-icon="mdi-lock-check-outline"
                required
                rounded="lg"
                type="password"
                variant="outlined"
              />
            </div>
          </div>

          <v-btn
            block
            class="fm-btn-submit mt-5"
            :loading="loading"
            rounded="lg"
            size="large"
            type="submit"
          >
            <template #loader>
              <v-progress-circular color="white" indeterminate size="20" width="2" />
            </template>
            Crear cuenta gratis
          </v-btn>
        </v-form>

        <p class="fm-terms">
          Al registrarte aceptas nuestros
          <button type="button" @click="showTerms = true">Términos de uso</button> y
          <button type="button" @click="showPrivacy = true">Política de privacidad</button>.
        </p>

        <LegalModal v-model="showPrivacy" type="privacy" />
        <LegalModal v-model="showTerms" type="terms" />

        <p class="fm-switch-link">
          ¿Ya tienes cuenta?
          <router-link :to="{ name: 'Login' }">Inicia sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/** Register — página de registro con formulario de datos personales y validación Zod. Usado en ruta '/register' */
import type { AxiosError } from 'axios';
import { ref } from 'vue';
import LegalModal from '@/components/LegalModal.vue';
import { useAuthStore } from '@/stores/auth';
import { registerSchema } from '@/validation';
import '@/styles/landing.css';

const auth = useAuthStore();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const showPrivacy = ref(false);
const showTerms = ref(false);

async function handleRegister() {
  const result = registerSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  });
  if (!result.success) {
    error.value = result.error.issues[0].message;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await auth.register(result.data.name, result.data.email, result.data.password);
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message;
    error.value = msg || 'Error al registrarse';
  } finally {
    loading.value = false;
  }
}
</script>
