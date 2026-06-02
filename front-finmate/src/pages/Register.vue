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
            Empieza tu<br>
            camino a la<br>
            <em>libertad</em><br>
            financiera.
          </h2>
          <p class="fm-panel-sub">
            Crea tu cuenta gratis y toma el control de cada peso desde el primer
            día.
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
            <div class="fm-deco-avatar" style="background: rgba(186, 117, 23, 0.4)">
              A
            </div>
            <div class="fm-deco-avatar" style="background: rgba(24, 95, 165, 0.4); margin-left: -8px">
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
        <div class="fm-form-header">
          <h1 class="fm-form-title">Crea tu cuenta</h1>
        </div>

        <v-alert v-if="error" class="fm-alert mb-5" closable density="compact" rounded="lg" type="error" variant="tonal"
          @click:close="error = ''">
          {{ error }}
        </v-alert>

        <v-form class="fm-form" @submit.prevent="handleRegister">
          <div class="fm-field-group">
            <label class="fm-label">Nombre completo</label>
            <v-text-field v-model="name" class="fm-input" density="comfortable" hide-details="auto"
              placeholder="Tu nombre" prepend-inner-icon="mdi-account-outline" required rounded="lg"
              variant="outlined" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label">Correo electrónico</label>
            <v-text-field v-model="email" class="fm-input" density="comfortable" hide-details="auto"
              placeholder="tu@correo.com" prepend-inner-icon="mdi-email-outline" required rounded="lg" type="email"
              variant="outlined" />
          </div>

          <div class="fm-field-row">
            <div class="fm-field-group">
              <label class="fm-label">Contraseña</label>
              <v-text-field v-model="password" class="fm-input" density="comfortable" hide-details="auto"
                placeholder="••••••••" prepend-inner-icon="mdi-lock-outline" required rounded="lg" type="password"
                variant="outlined" />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Confirmar contraseña</label>
              <v-text-field v-model="confirmPassword" class="fm-input" density="comfortable" hide-details="auto"
                placeholder="••••••••" prepend-inner-icon="mdi-lock-check-outline" required rounded="lg"
                :rules="[confirmMatch]" type="password" variant="outlined" />
            </div>
          </div>

          <v-btn block class="fm-btn-submit mt-5" :loading="loading" rounded="lg" size="large" type="submit">
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
import type { AxiosError } from 'axios'
import { ref } from 'vue'
import LegalModal from '@/components/LegalModal.vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/theme.css'

const auth = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const showPrivacy = ref(false)
const showTerms = ref(false)

function confirmMatch(v: string) {
  return v === password.value || 'Las contraseñas no coinciden'
}

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.register(name.value, email.value, password.value)
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message
    error.value = msg || 'Error al registrarse'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fm-panel-bg::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(29, 158, 117, 0.22);
  top: -120px;
  right: -160px;
}

.fm-panel-bg::before {
  content: '';
  position: absolute;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  bottom: -80px;
  left: -100px;
}

.fm-panel-body {
  margin-top: 40px;
  margin-bottom: 28px;
}

.fm-panel-headline {
  font-size: 38px;
}

.fm-panel-sub {
  font-size: 15px;
  max-width: 260px;
  margin-bottom: 0;
}

.fm-form-title {
  font-size: 28px;
}

.fm-form-sub {
  font-size: 14px;
}

.fm-form-header {
  margin-bottom: 28px;
}
</style>
