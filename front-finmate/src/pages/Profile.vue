<template>
  <div class="dashboard-container">
    <div class="dashboard-greeting">
      <h1>Mi Perfil</h1>
      <p>Administra tu informaci&oacute;n personal</p>
    </div>

    <div class="page-grid">
      <div class="content-card">
        <h2 class="content-card-title">Actualizar nombre</h2>

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
            <label class="fm-label" for="profile-name">Nombre</label>

            <v-text-field
              id="profile-name"
              v-model="name"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrorsName.name ? [fieldErrorsName.name] : []"
              hide-details="auto"
              placeholder="Tu nombre"
              prepend-inner-icon="mdi-account-outline"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="fieldErrorsName.name = ''"
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
        <h2 class="content-card-title">Cambiar contrase&ntilde;a</h2>

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
            <label class="fm-label" for="profile-current-password">Contrase&ntilde;a actual</label>

            <v-text-field
              id="profile-current-password"
              v-model="currentPassword"
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrorsPassword.currentPassword ? [fieldErrorsPassword.currentPassword] : []"
              hide-details="auto"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline"
              required
              rounded="lg"
              type="password"
              variant="outlined"
              @update:model-value="fieldErrorsPassword.currentPassword = ''"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="profile-new-password">Nueva contrase&ntilde;a</label>

            <v-text-field
              id="profile-new-password"
              v-model="newPassword"
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrorsPassword.newPassword ? [fieldErrorsPassword.newPassword] : []"
              hide-details="auto"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline"
              required
              rounded="lg"
              type="password"
              variant="outlined"
              @update:model-value="fieldErrorsPassword.newPassword = ''"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="profile-confirm-password">Confirmar nueva contrase&ntilde;a</label>

            <v-text-field
              id="profile-confirm-password"
              v-model="confirmPassword"
              class="fm-input"
              density="comfortable"
              :error-messages="fieldErrorsPassword.confirmPassword ? [fieldErrorsPassword.confirmPassword] : []"
              hide-details="auto"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline"
              required
              rounded="lg"
              type="password"
              variant="outlined"
              @update:model-value="fieldErrorsPassword.confirmPassword = ''"
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
/** Profile — página de perfil para actualizar nombre y cambiar contraseña con validación Zod. Usado en ruta '/profile' */
import type { AxiosError } from 'axios';
import { onMounted, ref } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { changePasswordSchema, updateProfileSchema } from '@/validation';
import '@/styles/auth.css';

const auth = useAuthStore();

const name = ref('');

const nameLoading = ref(false);
const nameError = ref('');
const nameSuccess = ref('');
const fieldErrorsName = ref<Record<string, string>>({});

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const passwordLoading = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');
const fieldErrorsPassword = ref<Record<string, string>>({});

onMounted(() => {
  if (auth.user) {
    name.value = auth.user.name;
  }
});

async function handleUpdateName() {
  const result = updateProfileSchema.safeParse({ name: name.value });
  if (!result.success) {
    fieldErrorsName.value = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fieldErrorsName.value[field] = issue.message;
    }
    return;
  }
  nameLoading.value = true;
  nameError.value = '';
  nameSuccess.value = '';
  fieldErrorsName.value = {};
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
    fieldErrorsPassword.value = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fieldErrorsPassword.value[field] = issue.message;
    }
    return;
  }
  passwordLoading.value = true;
  passwordError.value = '';
  passwordSuccess.value = '';
  fieldErrorsPassword.value = {};
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
