<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        Contribuir · {{ goalTitle }}
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

        <div class="mb-4 pa-3 bg-green-deep-05">
          <div style="display: flex; justify-content: space-between; font-size: 13px">
            <span>Progreso actual</span>

            <span style="font-weight: 500">
              {{ formatCurrency(currentAmount) }} de {{ formatCurrency(targetAmount) }}
            </span>
          </div>
        </div>

        <v-form @submit.prevent="$emit('save')">
          <div class="fm-field-group">
            <label class="fm-label" for="contribute-amount">Monto a contribuir</label>

            <AmountInput id="contribute-amount" :model-value="amount" placeholder="0" required @update:model-value="$emit('update:amount', $event)" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="contribute-date">Fecha</label>
            <DatePicker id="contribute-date" :model-value="date" required @update:model-value="$emit('update:date', $event ?? new Date())" />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="contribute-notes">Notas (opcional)</label>

            <v-textarea
              id="contribute-notes"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              maxlength="255"
              :model-value="notes"
              placeholder="Nota sobre el aporte"
              rounded="lg"
              rows="2"
              variant="outlined"
              @update:model-value="$emit('update:notes', $event)"
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
          Contribuir
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
import { formatCurrency } from '@/utils/format';

defineProps<{
  modelValue: boolean;
  goalTitle: string;
  currentAmount: string;
  targetAmount: string;
  amount: string;
  date: Date;
  notes: string;
  error: string;
  loading: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
  'update:amount': [value: string];
  'update:date': [value: Date];
  'update:notes': [value: string];
  'update:error': [value: string];
  save: [];
}>();
</script>
