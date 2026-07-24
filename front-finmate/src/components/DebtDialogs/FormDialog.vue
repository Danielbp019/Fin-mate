<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        {{ isEditing ? 'Editar deuda' : 'Nueva deuda' }}
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
            <label class="fm-label" for="debt-title">Título</label>

            <v-text-field
              id="debt-title"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              :model-value="title"
              placeholder="Ej: Tarjeta de crédito"
              required
              rounded="lg"
              variant="outlined"
              @update:model-value="$emit('update:title', $event)"
            />
          </div>

          <div class="fm-field-row">
            <div class="fm-field-group">
              <label class="fm-label" for="debt-amount">Monto inicial</label>

              <AmountInput id="debt-amount" :model-value="initialAmount" placeholder="0" required @update:model-value="$emit('update:initialAmount', $event)" />
            </div>

            <div class="fm-field-group">
              <label class="fm-label" for="debt-priority">Prioridad</label>

              <v-select
                id="debt-priority"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                :items="priorityOptions"
                :model-value="priority"
                required
                rounded="lg"
                variant="outlined"
                @update:model-value="$emit('update:priority', $event)"
              />
            </div>
          </div>

          <div class="fm-field-row">
            <div class="fm-field-group">
              <label class="fm-label" for="debt-interest">Tasa de interés % (opcional)</label>

              <div style="display: flex; gap: 8px; align-items: start">
                <InterestRateInput id="debt-interest" :model-value="interestRate" @update:model-value="$emit('update:interestRate', $event)" />

                <v-select
                  id="debt-interest-type"
                  class="fm-input"
                  density="comfortable"
                  hide-details="auto"
                  :items="interestRateTypeOptions"
                  :model-value="interestRateType"
                  rounded="lg"
                  style="max-width: 120px"
                  variant="outlined"
                  @update:model-value="$emit('update:interestRateType', $event)"
                />
              </div>
            </div>

            <div class="fm-field-group">
              <label class="fm-label" for="debt-min-payment">Pago mínimo (opcional)</label>

              <AmountInput id="debt-min-payment" :model-value="minimumPayment" placeholder="0" @update:model-value="$emit('update:minimumPayment', $event)" />
            </div>
          </div>

          <div class="fm-field-row">
            <div class="fm-field-group">
              <label class="fm-label" for="debt-due-date">Fecha de vencimiento (opcional)</label>

              <DatePicker id="debt-due-date" :model-value="dueDate ?? null" @update:model-value="$emit('update:dueDate', $event)" />
            </div>

            <div class="fm-field-group">
              <label class="fm-label" for="debt-start-date">Fecha de inicio (opcional)</label>
              <DatePicker id="debt-start-date" :model-value="startDate ?? null" @update:model-value="$emit('update:startDate', $event)" />
            </div>
          </div>

          <div v-if="isEditing" class="fm-field-group">
            <label class="fm-label" for="debt-status">Estado</label>

            <v-select
              id="debt-status"
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              :items="statusOptions"
              :model-value="status"
              rounded="lg"
              variant="outlined"
              @update:model-value="$emit('update:status', $event)"
            />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="debt-description">Descripción (opcional)</label>

            <v-textarea
              id="debt-description"
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
          {{ isEditing ? 'Guardar cambios' : 'Crear deuda' }}
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
import InterestRateInput from '@/components/DebtDialogs/InterestRateInput.vue';

withDefaults(defineProps<{
  modelValue: boolean;
  isEditing: boolean;
  title: string;
  initialAmount: string;
  priority: string;
  interestRate?: string;
  interestRateType?: string;
  minimumPayment?: string;
  dueDate?: Date | null;
  startDate?: Date | null;
  status?: string;
  description?: string;
  formError?: string;
  saving?: boolean;
}>(), {
  formError: '',
  saving: false,
  interestRateType: 'annual',
});

const priorityOptions = [
  { title: 'Baja', value: 'low' },
  { title: 'Media', value: 'medium' },
  { title: 'Alta', value: 'high' },
];

const interestRateTypeOptions = [
  { title: 'Anual', value: 'annual' },
  { title: 'Mensual', value: 'monthly' },
];

const statusOptions = [
  { title: 'Pendiente', value: 'pending' },
  { title: 'Pagada', value: 'paid' },
  { title: 'Vencida', value: 'overdue' },
];

defineEmits<{
  'update:modelValue': [value: boolean];
  'update:title': [value: string];
  'update:initialAmount': [value: string];
  'update:priority': [value: string];
  'update:interestRate': [value: string];
  'update:interestRateType': [value: string];
  'update:minimumPayment': [value: string];
  'update:dueDate': [value: Date | null];
  'update:startDate': [value: Date | null];
  'update:status': [value: string];
  'update:description': [value: string];
  'update:formError': [value: string];
  save: [];
}>();

</script>
