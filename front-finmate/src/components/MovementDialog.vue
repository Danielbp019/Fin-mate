<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        {{ isEditing ? 'Editar movimiento' : 'Nuevo movimiento' }}
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
            <label class="fm-label" for="mov-type">Tipo</label>

            <v-select
              id="mov-type"
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              :items="typeOptions"
              :model-value="type"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="onTypeChange($event)"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="mov-category">Categoría</label>

            <v-select
              id="mov-category"
              class="fm-input"
              clearable
              density="comfortable"
              hide-details="auto"
              item-title="title"
              item-value="value"
              :items="availableCategories"
              :model-value="categoryId"
              placeholder="Selecciona una categoría"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="$emit('update:categoryId', $event)"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="mov-amount">Monto</label>

            <AmountInput id="mov-amount" :model-value="amount" placeholder="0" required @update:model-value="$emit('update:amount', $event)" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="mov-date">Fecha</label>
            <DatePicker id="mov-date" :model-value="movementDate" required @update:model-value="$emit('update:movementDate', $event ?? new Date())" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="mov-description">Descripción (opcional)</label>

            <v-textarea
              id="mov-description"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              maxlength="255"
              :model-value="description"
              placeholder="Agrega una nota"
              rounded="lg"
              rows="2"
              variant="outlined"
              @update:model-value="$emit('update:description', $event)"
            />
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
          {{ isEditing ? 'Guardar cambios' : 'Crear movimiento' }}
          <template #loader>
            <v-progress-circular color="white" indeterminate size="20" width="2" />
          </template>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import AmountInput from '@/components/AmountInput.vue';
import DatePicker from '@/components/DatePicker.vue';

defineProps<{
  modelValue: boolean;
  isEditing: boolean;
  type: string;
  categoryId: string | null;
  amount: string;
  description: string;
  movementDate: Date;
  availableCategories: { title: string; value: string }[];
  formError: string;
  saving: boolean;
}>();

const typeOptions = [
  { title: 'Ingreso', value: 'income' },
  { title: 'Gasto', value: 'expense' },
];

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:type': [value: string];
  'update:categoryId': [value: string | null];
  'update:amount': [value: string];
  'update:description': [value: string];
  'update:movementDate': [value: Date];
  'update:formError': [value: string];
  save: [];
}>();

function onTypeChange(value: string) {
  emit('update:type', value);
  emit('update:categoryId', null);
}
</script>
