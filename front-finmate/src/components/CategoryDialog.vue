<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        {{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}
        <v-spacer />

        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-alert
          v-if="formError"
          class="mb-4"
          closable
          density="compact"
          rounded="lg"
          type="error"
          variant="tonal"
          @click:close="$emit('update:formError', '')"
        >
          {{ formError }}
        </v-alert>

        <v-form @submit.prevent="$emit('save')">
          <div class="fm-field-group">
            <label class="fm-label" for="cat-name">Nombre</label>

            <v-text-field
              id="cat-name"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              :model-value="name"
              placeholder="Ej: Salario"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="$emit('update:name', $event)"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="cat-type">Tipo</label>

            <v-select
              id="cat-type"
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              :items="typeOptions"
              :model-value="type"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="$emit('update:type', $event)"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="cat-icon">Icono (opcional)</label>
            <IconPicker id="cat-icon" :model-value="icon" @update:model-value="$emit('update:icon', $event ?? '')" />
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn
          class="fm-btn-submit"
          :loading="saving"
          rounded="lg"
          size="large"
          @click="$emit('save')"
        >
          {{ isEditing ? 'Guardar cambios' : 'Crear categoría' }}
          <template #loader>
            <v-progress-circular color="white" indeterminate size="20" width="2" />
          </template>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import IconPicker from '@/components/IconPicker.vue';

withDefaults(defineProps<{
  modelValue: boolean;
  isEditing: boolean;
  name: string;
  type: string;
  icon: string;
  formError?: string;
  saving?: boolean;
}>(), {
  formError: '',
  saving: false,
});

const typeOptions = [
  { title: 'Ingreso', value: 'income' },
  { title: 'Gasto', value: 'expense' },
];

defineEmits<{
  'update:modelValue': [value: boolean];
  'update:name': [value: string];
  'update:type': [value: string];
  'update:icon': [value: string];
  'update:formError': [value: string];
  save: [];
}>();
</script>
