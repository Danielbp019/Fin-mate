<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        {{ isEditing ? 'Editar meta' : 'Nueva meta' }}
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
            <label class="fm-label" for="goal-title">Título</label>

            <v-text-field
              id="goal-title"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              :model-value="title"
              placeholder="Ej: Viaje a la playa"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="$emit('update:title', $event)"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="goal-amount">Monto objetivo</label>

            <AmountInput id="goal-amount" :model-value="targetAmount" placeholder="0" required @update:model-value="$emit('update:targetAmount', $event)" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="goal-deadline">Fecha límite (opcional)</label>
            <DatePicker id="goal-deadline" :model-value="deadline" @update:model-value="$emit('update:deadline', $event)" />
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
          {{ isEditing ? 'Guardar cambios' : 'Crear meta' }}
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
  title: string;
  targetAmount: string;
  deadline: Date | null;
  error: string;
  loading: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
  'update:title': [value: string];
  'update:targetAmount': [value: string];
  'update:deadline': [value: Date | null];
  'update:error': [value: string];
  save: [];
}>();
</script>
