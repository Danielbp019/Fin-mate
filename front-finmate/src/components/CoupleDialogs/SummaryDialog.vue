<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        Resumen de aportes · {{ goalTitle }}
        <v-spacer />

        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-alert
          v-if="status && status !== 'active'"
          class="mb-4"
          density="compact"
          rounded="lg"
          type="info"
          variant="tonal"
        >
          Meta {{ status === 'completed' ? 'completada' : 'cancelada' }}
        </v-alert>

        <template v-if="rows.length > 0">
          <div
            v-for="row in rows"
            :key="row.userId"
            class="mb-3 pa-3 bg-green-deep-05"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <span style="font-weight: 600; font-size: 15px">{{ row.userName }}</span>

                <v-chip
                  v-if="row.role === 'owner'"
                  class="ml-2"
                  color="var(--green-deep)"
                  size="x-small"
                  variant="tonal"
                >
                  Propietario
                </v-chip>
              </div>

              <span style="font-weight: 700; font-size: 16px">
                {{ formatCurrency(String(row.total)) }}
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px">
              <v-progress-linear
                :color="row.percentage >= 50 ? 'var(--green-deep)' : 'orange'"
                height="6"
                :model-value="row.percentage"
                rounded
                style="flex: 1"
              />

              <span style="font-size: 13px; font-weight: 500; min-width: 48px; text-align: right">
                {{ Math.round(row.percentage) }}%
              </span>
            </div>
          </div>

          <v-divider class="my-3" />

          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px">
            <span>Total aportado</span>
            <span>{{ formatCurrency(totalAmount) }}</span>
          </div>
        </template>

        <div v-else class="text-center pa-4 text-87">
          <v-icon size="40" style="opacity: 0.6">mdi-currency-usd-off</v-icon>
          <p class="mt-2">No hay aportes registrados en esta meta</p>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn class="fm-btn-submit" rounded="lg" @click="$emit('update:modelValue', false)">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { formatCurrency } from '@/utils/format';

interface SummaryRow {
  userId: string;
  userName: string;
  total: number;
  percentage: number;
  role: string;
}

defineProps<{
  modelValue: boolean;
  goalTitle: string;
  status?: string;
  totalAmount: string;
  rows: SummaryRow[];
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
