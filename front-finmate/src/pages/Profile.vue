<template>
  <div class="dashboard-container">
    <div class="dashboard-greeting">
      <h1>Mi Perfil</h1>
      <p>Administra tu informaci&oacute;n personal</p>
    </div>

    <div class="page-grid">
      <div class="content-card">
        <h3 class="content-card-title">Actualizar nombre</h3>

        <v-alert v-if="nameError" class="fm-alert mb-4" closable density="compact" rounded="lg" type="error"
          variant="tonal" @click:close="nameError = ''">
          {{ nameError }}
        </v-alert>

        <v-alert v-if="nameSuccess" class="fm-alert mb-4" closable density="compact" rounded="lg" type="success"
          variant="tonal" @click:close="nameSuccess = ''">
          {{ nameSuccess }}
        </v-alert>

        <v-form @submit.prevent="handleUpdateName">
          <div class="fm-field-group">
            <label class="fm-label">Nombre</label>
            <v-text-field v-model="name" class="fm-input" density="comfortable" hide-details="auto"
              placeholder="Tu nombre" prepend-inner-icon="mdi-account-outline" required rounded="lg"
              variant="outlined" />
          </div>

          <v-btn class="fm-btn-submit mt-2" :loading="nameLoading" rounded="lg" size="large" type="submit">
            <template #loader>
              <v-progress-circular color="white" indeterminate size="20" width="2" />
            </template>
            Guardar cambios
          </v-btn>
        </v-form>
      </div>

      <div class="content-card">
        <h3 class="content-card-title">Cambiar contrase&ntilde;a</h3>

        <v-alert v-if="passwordError" class="fm-alert mb-4" closable density="compact" rounded="lg" type="error"
          variant="tonal" @click:close="passwordError = ''">
          {{ passwordError }}
        </v-alert>

        <v-alert v-if="passwordSuccess" class="fm-alert mb-4" closable density="compact" rounded="lg" type="success"
          variant="tonal" @click:close="passwordSuccess = ''">
          {{ passwordSuccess }}
        </v-alert>

        <v-form @submit.prevent="handleChangePassword">
          <div class="fm-field-group">
            <label class="fm-label">Contrase&ntilde;a actual</label>
            <v-text-field v-model="currentPassword" class="fm-input" density="comfortable" hide-details="auto"
              placeholder="••••••••" prepend-inner-icon="mdi-lock-outline" required rounded="lg" type="password"
              variant="outlined" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label">Nueva contrase&ntilde;a</label>
            <v-text-field v-model="newPassword" class="fm-input" density="comfortable"
              :error-messages="newPasswordErrors" hide-details="auto" placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline" required rounded="lg" type="password" variant="outlined" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label">Confirmar nueva contrase&ntilde;a</label>
            <v-text-field v-model="confirmPassword" class="fm-input" density="comfortable"
              :error-messages="confirmPasswordErrors" hide-details="auto" placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline" required rounded="lg" type="password" variant="outlined" />
          </div>

          <v-btn class="fm-btn-submit mt-2" :loading="passwordLoading" rounded="lg" size="large" type="submit">
            <template #loader>
              <v-progress-circular color="white" indeterminate size="20" width="2" />
            </template>
            Cambiar contrase&ntilde;a
          </v-btn>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AxiosError } from 'axios'
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import '@/styles/theme.css'

const auth = useAuthStore()

const name = ref('')

const nameLoading = ref(false)
const nameError = ref('')
const nameSuccess = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

function validatePassword(pw: string): string | null {
  if (pw.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
  return null
}

const confirmPasswordErrors = computed(() => {
  if (!confirmPassword.value) return []
  if (confirmPassword.value !== newPassword.value) return ['Las contraseñas no coinciden']
  return []
})

const newPasswordErrors = computed(() => {
  if (!newPassword.value) return []
  const err = validatePassword(newPassword.value)
  return err ? [err] : []
})

onMounted(() => {
  if (auth.user) {
    name.value = auth.user.name
  }
})

async function handleUpdateName() {
  nameLoading.value = true
  nameError.value = ''
  nameSuccess.value = ''
  try {
    await auth.updateProfile(name.value)
    nameSuccess.value = 'Nombre actualizado correctamente'
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message
    nameError.value = msg || 'Error al actualizar el nombre'
  } finally {
    nameLoading.value = false
  }
}

async function handleChangePassword() {
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  const pwErr = validatePassword(newPassword.value)
  if (pwErr) {
    passwordError.value = pwErr
    passwordLoading.value = false
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Las contraseñas no coinciden'
    passwordLoading.value = false
    return
  }

  try {
    const res = await api.post('/auth/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    passwordSuccess.value = res.data.message as string
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message
    passwordError.value = msg || 'Error al cambiar la contraseña'
  } finally {
    passwordLoading.value = false
  }
}
</script>
