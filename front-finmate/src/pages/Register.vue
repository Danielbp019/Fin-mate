<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-6" width="400">
      <v-card-title class="text-h5 text-center mb-4">Crear Cuenta</v-card-title>

      <v-alert
        v-if="error"
        class="mb-4"
        closable
        type="error"
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>

      <v-form @submit.prevent="handleRegister">
        <v-text-field
          v-model="name"
          label="Nombre"
          prepend-inner-icon="mdi-account"
          required
        />

        <v-text-field
          v-model="email"
          label="Email"
          prepend-inner-icon="mdi-email"
          required
          type="email"
        />

        <v-text-field
          v-model="password"
          label="Contraseña"
          prepend-inner-icon="mdi-lock"
          required
          type="password"
        />

        <v-text-field
          v-model="confirmPassword"
          label="Confirmar Contraseña"
          prepend-inner-icon="mdi-lock-check"
          required
          :rules="[confirmMatch]"
          type="password"
        />

        <v-btn
          block
          class="mt-2"
          color="primary"
          :loading="loading"
          type="submit"
        >
          Registrarse
        </v-btn>
      </v-form>

      <v-card-text class="text-center mt-4 pa-0">
        ¿Ya tienes cuenta?
        <router-link :to="{ name: 'Login' }">Inicia sesión</router-link>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import type { AxiosError } from 'axios'
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()

  const name = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const loading = ref(false)
  const error = ref('')

  function confirmMatch (v: string) {
    return v === password.value || 'Las contraseñas no coinciden'
  }

  async function handleRegister () {
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
