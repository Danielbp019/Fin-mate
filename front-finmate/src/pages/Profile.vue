<template>
  <div class="dashboard-container">
    <div class="dashboard-greeting">
      <h1>Mi Perfil</h1>
      <p>Administra tu informaci&oacute;n personal</p>
    </div>

    <div class="page-grid">
      <div class="content-card">
        <h3 class="content-card-title">Actualizar nombre</h3>

        <v-alert
          v-if="nameError"
          class="fm-alert mb-4"
          closable
          density="compact"
          rounded="lg"
          type="error"
          variant="tonal"
          @click:close="nameError = ''"
        >
          {{ nameError }}
        </v-alert>

        <v-alert
          v-if="nameSuccess"
          class="fm-alert mb-4"
          closable
          density="compact"
          rounded="lg"
          type="success"
          variant="tonal"
          @click:close="nameSuccess = ''"
        >
          {{ nameSuccess }}
        </v-alert>

        <v-form @submit.prevent="handleUpdateName">
          <div class="fm-field-group">
            <label class="fm-label">Nombre</label>

            <v-text-field
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

          <v-btn
            class="fm-btn-submit mt-2"
            :loading="nameLoading"
            rounded="lg"
            size="large"
            type="submit"
          >
            <template #loader>
              <v-progress-circular color="white" indeterminate size="20" width="2" />
            </template>
            Guardar cambios
          </v-btn>
        </v-form>
      </div>

      <div class="content-card">
        <h3 class="content-card-title">Cambiar contrase&ntilde;a</h3>

        <v-alert
          v-if="passwordError"
          class="fm-alert mb-4"
          closable
          density="compact"
          rounded="lg"
          type="error"
          variant="tonal"
          @click:close="passwordError = ''"
        >
          {{ passwordError }}
        </v-alert>

        <v-alert
          v-if="passwordSuccess"
          class="fm-alert mb-4"
          closable
          density="compact"
          rounded="lg"
          type="success"
          variant="tonal"
          @click:close="passwordSuccess = ''"
        >
          {{ passwordSuccess }}
        </v-alert>

        <v-form @submit.prevent="handleChangePassword">
          <div class="fm-field-group">
            <label class="fm-label">Contrase&ntilde;a actual</label>

            <v-text-field
              v-model="currentPassword"
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
            <label class="fm-label">Nueva contrase&ntilde;a</label>

            <v-text-field
              v-model="newPassword"
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
            <label class="fm-label">Confirmar nueva contrase&ntilde;a</label>

            <v-text-field
              v-model="confirmPassword"
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
            class="fm-btn-submit mt-2"
            :loading="passwordLoading"
            rounded="lg"
            size="large"
            type="submit"
          >
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
import type { AxiosError } from 'axios';
import { onMounted, ref } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { changePasswordSchema, updateProfileSchema } from '@/validation';
import '@/styles/theme.css';

const auth = useAuthStore();

const name = ref('');

const nameLoading = ref(false);
const nameError = ref('');
const nameSuccess = ref('');

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const passwordLoading = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');

onMounted(() => {
  if (auth.user) {
    name.value = auth.user.name;
  }
});

async function handleUpdateName() {
  const result = updateProfileSchema.safeParse({ name: name.value });
  if (!result.success) {
    nameError.value = result.error.issues[0].message;
    return;
  }
  nameLoading.value = true;
  nameError.value = '';
  nameSuccess.value = '';
  try {
    await auth.updateProfile(result.data.name);
    nameSuccess.value = 'Nombre actualizado correctamente';
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message;
    nameError.value = msg || 'Error al actualizar el nombre';
  } finally {
    nameLoading.value = false;
  }
}

async function handleChangePassword() {
  const result = changePasswordSchema.safeParse({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  });
  if (!result.success) {
    passwordError.value = result.error.issues[0].message;
    return;
  }
  passwordLoading.value = true;
  passwordError.value = '';
  passwordSuccess.value = '';
  try {
    const res = await api.post('/auth/change-password', {
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
    });
    passwordSuccess.value = res.data.message as string;
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error_) {
    const msg = (error_ as AxiosError<{ message?: string }>).response?.data?.message;
    passwordError.value = msg || 'Error al cambiar la contraseña';
  } finally {
    passwordLoading.value = false;
  }
}
</script>
