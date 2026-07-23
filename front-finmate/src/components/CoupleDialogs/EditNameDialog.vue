<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        Editar nombre del grupo
        <v-spacer />

        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-alert
          v-if="error"
          class="mb-4"
          closable
          density="compact"
          rounded="lg"
          type="error"
          variant="tonal"
          @click:close="$emit('update:error', '')"
        >
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="$emit('save')">
          <div class="fm-field-group">
            <label class="fm-label" for="couple-name-edit">Nombre</label>

            <v-text-field
              id="couple-name-edit"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              :model-value="name"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="$emit('update:name', $event)"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn
          class="fm-btn-submit"
          :loading="loading"
          rounded="lg"
          size="large"
          @click="$emit('save')"
        >
          Guardar
          <template #loader>
            <v-progress-circular color="white" indeterminate size="20" width="2" />
          </template>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: boolean;
  name: string;
  error: string;
  loading: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
  'update:name': [value: string];
  'update:error': [value: string];
  save: [];
}>();
</script>
