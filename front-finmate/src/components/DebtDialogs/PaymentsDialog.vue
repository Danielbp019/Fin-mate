<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="onClose"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        <template v-if="showForm">Registrar pago</template>
        <template v-else>Pagos · {{ debtTitle }}</template>
        <v-spacer />

        <v-btn icon variant="text" @click="onClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text v-if="!showForm" class="pa-4">
        <div
          class="mb-4 pa-3"
          style="background: rgba(var(--v-theme-primary), 0.05); border-radius: 12px"
        >
          <div style="display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap">
            <div>
              <span class="text-caption">Monto inicial</span>
              <p class="text-h6 font-weight-bold mt-0 mb-0">{{ formatCurrency(initialAmount) }}</p>
            </div>

            <div>
              <span class="text-caption">Monto actual</span>
              <p class="text-h6 font-weight-bold mt-0 mb-0">{{ formatCurrency(currentAmount) }}</p>
            </div>

            <div>
              <span class="text-caption">Progreso</span>
              <p class="text-h6 font-weight-bold mt-0 mb-0">{{ progressPercent }}%</p>
            </div>
          </div>

          <v-progress-linear
            class="mt-2"
            color="var(--green-deep)"
            height="8"
            :model-value="progressPercent"
            rounded
          />
        </div>

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

        <div class="d-flex align-center justify-space-between mb-3">
          <span class="text-subtitle-2 font-weight-bold">
            {{ payments.length }} pago(s) registrados
          </span>

          <v-btn
            class="fm-btn-submit"
            color="var(--green-deep)"
            prepend-icon="mdi-plus"
            size="small"
            @click="showForm = true"
          >
            Registrar pago
          </v-btn>
        </div>

        <v-data-table
          class="pa-0"
          :headers="paymentHeaders"
          hide-default-footer
          :items="payments"
          :items-per-page="-1"
          :loading="loading"
        >
          <template #loader>
            <LinearLoader :loading="loading" />
          </template>

          <template #item.amount="{ item }">
            -{{ formatCurrency(item.amount) }}
          </template>

          <template #item.paymentDate="{ item }">
            {{ formatDate(item.paymentDate) }}
          </template>

          <template #item.notes="{ item }">
            {{ item.notes ?? '-' }}
          </template>
        </v-data-table>

        <p
          v-if="payments.length === 0 && !loading"
          class="text-center text-caption mt-4"
        >
          Aún no hay pagos registrados para esta deuda.
        </p>
      </v-card-text>

      <v-card-text v-else class="pa-4">
        <v-alert
          v-if="payFormError"
          class="mb-4"
          closable
          density="compact"
          rounded="lg"
          type="error"
          variant="tonal"
          @click:close="payFormError = ''"
        >
          {{ payFormError }}
        </v-alert>

        <v-form @submit.prevent="handlePaymentSave">
          <div class="fm-field-group">
            <label class="fm-label" for="pay-amount">Monto</label>

            <AmountInput id="pay-amount" v-model="payForm.amount" placeholder="0" required />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="pay-date">Fecha</label>
            <DatePicker id="pay-date" v-model="payDate" required />
          </div>

          <div class="fm-field-group">
            <label class="fm-label" for="pay-notes">Notas (opcional)</label>

            <v-textarea
              id="pay-notes"
              v-model="payForm.notes"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              maxlength="255"
              placeholder="Nota sobre el pago"
              rounded="lg"
              rows="2"
              variant="outlined"
            />
          </div>
        </v-form>
      </v-card-text>

      <template v-if="showForm">
        <v-divider />

        <v-card-actions class="pa-4">
          <v-btn rounded="lg" variant="text" @click="showForm = false">Cancelar</v-btn>
          <v-spacer />

          <v-btn
            class="fm-btn-submit"
            :loading="paySaving"
            rounded="lg"
            size="large"
            @click="handlePaymentSave"
          >
            Registrar pago
            <template #loader>
              <v-progress-circular color="white" indeterminate size="20" width="2" />
            </template>
          </v-btn>
        </v-card-actions>
      </template>

      <template v-else>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="onClose">Cerrar</v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { CreatePaymentBody, Payment } from '@/types';
import type { AxiosError } from 'axios';
import { computed, ref } from 'vue';
import AmountInput from '@/components/AmountInput.vue';
import DatePicker from '@/components/DatePicker.vue';
import LinearLoader from '@/components/LinearLoader.vue';
import { useDebtsStore } from '@/stores/debts';
import { formatCurrency } from '@/utils/format';
import { createPaymentSchema } from '@/validation';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  debtId: string;
  debtTitle: string;
  initialAmount: string;
  currentAmount: string;
  error?: string;
  loading?: boolean;
  payments?: Payment[];
}>(), {
  error: '',
  loading: false,
  payments: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:error': [value: string];
}>();

const store = useDebtsStore();

const showForm = ref(false);
const payDate = ref(new Date());
const paySaving = ref(false);
const payFormError = ref('');
const payForm = ref<CreatePaymentBody>({
  amount: '',
  paymentDate: payDate.value.toISOString().slice(0, 10),
  notes: '',
});

const progressPercent = computed(() => {
  const init = Number(props.initialAmount);
  const curr = Number(props.currentAmount);
  if (init <= 0) return 0;
  return Math.round(((init - curr) / init) * 100);
});

const paymentHeaders = [
  { title: 'Monto', key: 'amount', sortable: false },
  { title: 'Fecha', key: 'paymentDate', sortable: false },
  { title: 'Notas', key: 'notes', sortable: false },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function onClose() {
  showForm.value = false;
  emit('update:modelValue', false);
}

async function handlePaymentSave() {
  const result = createPaymentSchema.safeParse({
    amount: payForm.value.amount,
    paymentDate: payDate.value.toISOString(),
    notes: payForm.value.notes?.trim() || undefined,
  });
  if (!result.success) {
    payFormError.value = result.error.issues[0].message;
    return;
  }
  paySaving.value = true;
  payFormError.value = '';
  try {
    const payload = result.data as CreatePaymentBody;

    await store.createPayment(props.debtId, payload);
    showForm.value = false;
    payForm.value = {
      amount: '',
      paymentDate: payDate.value.toISOString().slice(0, 10),
      notes: '',
    };
    emit('update:modelValue', false);
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ??
      'Error al registrar el pago';
    payFormError.value = msg;
  } finally {
    paySaving.value = false;
  }
}
</script>
