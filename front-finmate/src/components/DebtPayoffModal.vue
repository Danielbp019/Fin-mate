<template>
  <v-dialog
    max-width="800"
    :model-value="dialog"
    @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        <v-icon class="mr-2" color="var(--green-deep)">mdi-lightbulb-on-outline</v-icon>
        Plan de pago
        <v-spacer />

        <v-btn icon variant="text" @click="$emit('update:dialog', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text v-if="loading" class="pa-8 text-center">
        <v-progress-circular color="var(--green-deep)" indeterminate size="40" width="4" />
        <div class="mt-3 text-body-2 text-medium-emphasis">Calculando plan...</div>
      </v-card-text>

      <v-card-text v-else-if="error" class="pa-4">
        <v-alert closable density="compact" rounded="lg" type="error" variant="tonal" @click:close="error = ''">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-text v-else-if="plan" class="pa-4">
        <v-card class="mb-4" variant="tonal">
          <v-card-text class="pa-4">
            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 12px">
              <div>
                <div class="text-h6 font-weight-bold">{{ plan.title }}</div>

                <div class="text-body-2 text-medium-emphasis mt-1">
                  {{ formatCurrency(plan.currentAmount) }}
                  <template v-if="plan.progressPercent > 0">
                    &middot; Has pagado el {{ plan.progressPercent }}%
                  </template>
                </div>
              </div>

              <div class="text-right">
                <div class="text-caption text-medium-emphasis">Tasa de inter&eacute;s</div>
                <div class="text-body-1 font-weight-bold">{{ formatInterestRate(plan.interestRate) }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <div class="mb-4">
          <label class="fm-label">Pago mensual fijo</label>

          <div style="display: flex; gap: 12px; align-items: start; flex-wrap: wrap">
            <AmountInput v-model="customPayment" placeholder="0" style="max-width: 280px" />

            <v-btn
              class="mt-1"
              color="var(--green-deep)"
              density="compact"
              variant="tonal"
              @click="applyCustomPayment"
            >
              Calcular
            </v-btn>
          </div>
        </div>

        <v-row>
          <v-col v-for="scenario in plan.scenarios" :key="scenario.label" cols="12" md="4">
            <v-card
              :class="scenario.label === 'Recomendado' ? 'scenario-recommended' : ''"
              :variant="scenario.label === 'Recomendado' ? 'elevated' : 'tonal'"
            >
              <v-card-title class="text-body-1 font-weight-bold d-flex align-center">
                {{ scenario.label }}
                <v-chip
                  v-if="scenario.label === 'Recomendado'"
                  class="ml-2"
                  color="green"
                  size="x-small"
                  variant="flat"
                >
                Sugerido
                </v-chip>
              </v-card-title>

              <v-card-text>
                <div class="text-h6 font-weight-bold" style="color: var(--green-deep)">
                  {{ formatCurrency(scenario.monthlyPayment) }}
                  <span class="text-body-2 text-medium-emphasis">/mes</span>
                </div>

                <v-divider class="my-2" />

                <div class="stat-row-compact">
                  <span class="text-caption text-medium-emphasis">Duraci&oacute;n</span>
                  <span class="text-body-2 font-weight-bold">{{ scenario.totalMonths }} meses</span>
                </div>

                <div class="stat-row-compact">
                  <span class="text-caption text-medium-emphasis">Inter&eacute;s total</span>
                  <span class="text-body-2">{{ formatCurrency(scenario.totalInterestPaid) }}</span>
                </div>

                <div class="stat-row-compact">
                  <span class="text-caption text-medium-emphasis">Total pagado</span>
                  <span class="text-body-2">{{ formatCurrency(scenario.totalPaid) }}</span>
                </div>

                <div class="stat-row-compact">
                  <span class="text-caption text-medium-emphasis">Fecha estimada</span>
                  <span class="text-body-2">{{ formatDate(scenario.estimatedPayoffDate) }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-if="plan.tips.length > 0" class="mt-4" variant="tonal">
          <v-card-title class="text-body-1 font-weight-bold">
            <v-icon class="mr-1" color="var(--green-deep)" size="small">mdi-lightbulb-on-outline</v-icon>
            Consejos para esta deuda
          </v-card-title>

          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="tip in plan.tips"
                :key="tip.type"
                prepend-icon="mdi-lightbulb-on"
              >
                <v-list-item-title class="text-body-2">{{ tip.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ tip.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-text v-else class="pa-8 text-center">
        <v-icon class="mb-2" color="grey" size="48">mdi-credit-card-off</v-icon>
        <div class="text-body-1">No se pudo generar el plan</div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DebtPayoffPlan } from '@/types';
import { ref, watch } from 'vue';
import AmountInput from '@/components/AmountInput.vue';
import api from '@/services/api';
import { formatCurrency, formatInterestRate } from '@/utils/format';

const props = defineProps<{
  dialog: boolean;
  debt: {
    id: string;
    title: string;
    currentAmount: string;
    interestRate: string;
    minimumPayment: string;
    initialAmount: string;
  } | null;
}>();

defineEmits<{
  'update:dialog': [value: boolean];
}>();

const plan = ref<DebtPayoffPlan | null>(null);
const loading = ref(false);
const error = ref('');
const customPayment = ref('');

watch(
  () => props.dialog,
  (open) => {
    if (open && props.debt) {
      fetchPlan();
    }
  },
);

watch(
  () => props.debt,
  () => {
    customPayment.value = '';
  },
);

function stripAmount(val: string): string {
  return val.replace(/[^\d]/g, '');
}

async function fetchPlan(payment?: string) {
  if (!props.debt) return;

  loading.value = true;
  error.value = '';
  plan.value = null;

  try {
    const params: Record<string, string> = {};
    if (payment) {
      params.monthlyPayment = stripAmount(payment);
    }
    const { data } = await api.get(`/debt-advisor/debt/${props.debt.id}`, { params });
    plan.value = data;
  } catch (error_: any) {
    error.value = error_.response?.data?.error ?? 'Error al generar el plan';
  } finally {
    loading.value = false;
  }
}

function applyCustomPayment() {
  const raw = stripAmount(customPayment.value);
  if (!raw) return;
  fetchPlan(raw);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
}
</script>

<style scoped>
.stat-row-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}
.scenario-recommended {
  border: 2px solid var(--green-deep) !important;
}
</style>
