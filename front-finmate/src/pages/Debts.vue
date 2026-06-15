<template>
  <div class="dashboard-container">
    <div
      class="dashboard-greeting"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>
        <h1>Deudas</h1>
        <p>Administra tus deudas y registra tus pagos</p>
      </div>

      <v-btn class="fm-btn-submit" color="var(--green-deep)" prepend-icon="mdi-plus" @click="openCreate">
        Nueva deuda
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text class="pa-4">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
          <v-tabs v-model="filterStatus" color="var(--green-deep)" density="compact" hide-slider>
            <v-tab value="">Todas</v-tab>
            <v-tab value="pending">Pendientes</v-tab>
            <v-tab value="paid">Pagadas</v-tab>
            <v-tab value="overdue">Vencidas</v-tab>
          </v-tabs>

          <v-select
            v-model="filterPriority"
            aria-label="Prioridad"
            class="fm-input"
            clearable
          density="compact"
          hide-details="auto"
          :items="priorityOptions"
          placeholder="Prioridad"
          rounded="lg"
          style="min-width: 140px"
          variant="outlined"
        />
        </div>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="store.error"
      class="mb-4"
      closable
      density="compact"
      rounded="lg"
      type="error"
      variant="tonal"
      @click:close="store.error = ''"
    >
      {{ store.error }}
    </v-alert>

    <v-card>
      <v-data-table
        class="pa-2"
        :headers="headers"
        hide-default-footer
        :items="store.debts"
        :items-per-page="-1"
        :loading="store.loading"
      >
        <template #loader>
          <LinearLoader :loading="store.loading" />
        </template>

        <template #item.priority="{ item }">
          <v-chip :color="priorityColor(item.priority)" size="small">
            {{ priorityLabel(item.priority) }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
            {{ statusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.initialAmount="{ item }">
          {{ formatCurrency(item.initialAmount) }}
        </template>

        <template #item.currentAmount="{ item }">
          {{ formatCurrency(item.currentAmount) }}
        </template>

        <template #item.interestRate="{ item }">
          {{ formatInterestRate(item.interestRate) }}
        </template>

        <template #item.actions="{ item }">
          <v-tooltip location="top" text="Editar deuda">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="text" @click="openEdit(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip location="top" text="Ver pagos">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="text" @click="openPayments(item)">
                <v-icon>mdi-currency-usd</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip location="top" text="Eliminar deuda">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                icon
                size="small"
                variant="text"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="520">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">
          {{ editingId ? 'Editar deuda' : 'Nueva deuda' }}
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
            @click:close="formError = ''"
          >
            {{ formError }}
          </v-alert>

          <v-form @submit.prevent="handleSave">
            <div class="fm-field-group">
              <label class="fm-label" for="debt-title">Título</label>

              <v-text-field
                id="debt-title"
                v-model="form.title"
                v-capitalize-first
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                placeholder="Ej: Tarjeta de crédito"
                required
                rounded="lg"
                variant="outlined"
              />
            </div>

            <div class="fm-field-row">
              <div class="fm-field-group">
                <label class="fm-label" for="debt-amount">Monto inicial</label>

                <AmountInput id="debt-amount" v-model="form.initialAmount" placeholder="0" required />
              </div>

              <div class="fm-field-group">
                <label class="fm-label" for="debt-priority">Prioridad</label>

                <v-select
                  id="debt-priority"
                  v-model="form.priority"
                  class="fm-input"
                  density="comfortable"
                  hide-details="auto"
                  :items="priorityOptions"
                  required
                  rounded="lg"
                  variant="outlined"
                />
              </div>
            </div>

            <div class="fm-field-row">
              <div class="fm-field-group">
                <label class="fm-label" for="debt-interest">Tasa de interés % (opcional)</label>

                <InterestRateInput id="debt-interest" v-model="form.interestRate" />
              </div>

              <div class="fm-field-group">
                <label class="fm-label" for="debt-min-payment">Pago mínimo (opcional)</label>

                <AmountInput id="debt-min-payment" v-model="form.minimumPayment" placeholder="0" />
              </div>
            </div>

            <div class="fm-field-row">
              <div class="fm-field-group">
                <label class="fm-label" for="debt-due-day">Día de vencimiento (opcional)</label>

                <v-text-field
                  id="debt-due-day"
                  v-model="form.dueDay"
                  class="fm-input"
                  density="comfortable"
                  hide-details="auto"
                  max="31"
                  min="1"
                  placeholder="15"
                  rounded="lg"
                  type="number"
                  variant="outlined"
                />
              </div>

              <div class="fm-field-group">
                <label class="fm-label" for="debt-start-date">Fecha de inicio (opcional)</label>
                <DatePicker id="debt-start-date" v-model="debtStartDate" />
              </div>
            </div>

            <div v-if="editingId" class="fm-field-group">
              <label class="fm-label" for="debt-status">Estado</label>

              <v-select
                id="debt-status"
                v-model="form.status"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                :items="statusOptions"
                rounded="lg"
                variant="outlined"
              />
            </div>

            <div class="fm-field-group">
              <label class="fm-label" for="debt-description">Descripción (opcional)</label>

              <v-textarea
                id="debt-description"
                v-model="form.description"
                v-capitalize-first
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                maxlength="255"
                placeholder="Agrega una nota"
                rounded="lg"
                rows="2"
                variant="outlined"
              />
            </div>

            <v-btn
              block
              class="fm-btn-submit mt-2"
              :loading="saving"
              rounded="lg"
              size="large"
              type="submit"
            >
              {{ editingId ? 'Guardar cambios' : 'Crear deuda' }}
              <template #loader>
                <v-progress-circular color="white" indeterminate size="20" width="2" />
              </template>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">Eliminar deuda</v-card-title>
        <v-divider />

        <v-card-text class="pa-4">
          <p>
            ¿Estás seguro de eliminar la deuda <strong>{{ deletingItem?.title }}</strong
            >?
          </p>

          <p class="mt-2 text-caption">Esta acción no elimina los pagos registrados.</p>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="deleteDialogOpen = false">Cancelar</v-btn>

          <v-btn
            color="error"
            :loading="deleting"
            rounded="lg"
            variant="tonal"
            @click="handleDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="paymentsDialogOpen" max-width="600">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">
          Pagos · {{ selectedDebt?.title }}
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <div
            v-if="selectedDebt"
            class="mb-4 pa-3"
            style="background: rgba(var(--v-theme-primary), 0.05); border-radius: 12px"
          >
            <div style="display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap">
              <div>
                <span class="text-caption">Monto inicial</span>

                <p class="text-h6 font-weight-bold mt-0 mb-0">
                  {{ formatCurrency(selectedDebt.initialAmount) }}
                </p>
              </div>

              <div>
                <span class="text-caption">Monto actual</span>

                <p class="text-h6 font-weight-bold mt-0 mb-0">
                  {{ formatCurrency(selectedDebt.currentAmount) }}
                </p>
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
            v-if="paymentsError"
            class="mb-4"
            closable
            density="compact"
            rounded="lg"
            type="error"
            variant="tonal"
            @click:close="paymentsError = ''"
          >
            {{ paymentsError }}
          </v-alert>

          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-subtitle-2 font-weight-bold"
              >{{ payments.length }} pago(s) registrados</span
            >

            <v-btn
              class="fm-btn-submit"
              color="var(--green-deep)"
              prepend-icon="mdi-plus"
              size="small"
              @click="openPaymentForm"
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
            :loading="paymentsLoading"
          >
            <template #loader>
              <LinearLoader :loading="paymentsLoading" />
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

          <p v-if="payments.length === 0 && !paymentsLoading" class="text-center text-caption mt-4">
            Aún no hay pagos registrados para esta deuda.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="paymentsDialogOpen = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="paymentDialogOpen" max-width="420">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">Registrar pago</v-card-title>
        <v-divider />

        <v-card-text class="pa-4">
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

            <v-btn
              block
              class="fm-btn-submit mt-2"
              :loading="paySaving"
              rounded="lg"
              size="large"
              type="submit"
            >
              Registrar pago
              <template #loader>
                <v-progress-circular color="white" indeterminate size="20" width="2" />
              </template>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
/** Debts — CRUD de deudas con filtros, gestión de pagos, barra de progreso y diálogos múltiples. Usado en ruta '/debts' */
import type { CreateDebtBody, CreatePaymentBody, Debt, Payment, UpdateDebtBody } from '@/types';
import type { AxiosError } from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import AmountInput from '@/components/AmountInput.vue';
import DatePicker from '@/components/DatePicker.vue';
import InterestRateInput from '@/components/InterestRateInput.vue';
import LinearLoader from '@/components/LinearLoader.vue';
import { useDebtsStore } from '@/stores/debts';
import { formatCurrency, formatInterestRate } from '@/utils/format';
import { createDebtSchema, createPaymentSchema, updateDebtSchema } from '@/validation';
import '@/styles/theme.css';

interface DebtForm {
  title: string;
  description?: string;
  initialAmount: string;
  interestRate?: string;
  minimumPayment?: string;
  dueDay?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'paid' | 'overdue';
  startDate?: string;
}

const store = useDebtsStore();

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const deleting = ref(false);
const deletingItem = ref<Debt | null>(null);
const formError = ref('');

const filterStatus = ref('');
const filterPriority = ref<string | null>(null);

const debtStartDate = ref<Date | null>(null);
const payDate = ref(new Date());

watch(debtStartDate, (d) => {
  form.value.startDate = d ? d.toISOString().slice(0, 10) : '';
});

watch(payDate, (d) => {
  payForm.value.paymentDate = d.toISOString().slice(0, 10);
});

let filterTimeout: ReturnType<typeof setTimeout>;

watch([filterStatus, filterPriority], () => {
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => applyFilters(), 300);
});

const form = ref<DebtForm>({
  title: '',
  initialAmount: '',
  priority: 'medium',
  interestRate: '',
  minimumPayment: '',
  dueDay: undefined,
  startDate: '',
  description: '',
});

const priorityOptions = [
  { title: 'Baja', value: 'low' },
  { title: 'Media', value: 'medium' },
  { title: 'Alta', value: 'high' },
];

const statusOptions = [
  { title: 'Pendiente', value: 'pending' },
  { title: 'Pagada', value: 'paid' },
  { title: 'Vencida', value: 'overdue' },
];

const headers = [
  { title: 'Título', key: 'title', align: 'start' as const },
  { title: 'Monto inicial', key: 'initialAmount', sortable: false },
  { title: 'Monto actual', key: 'currentAmount', sortable: false },
  { title: 'Prioridad', key: 'priority', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Día venc.', key: 'dueDay', sortable: false },
  { title: 'Interés %', key: 'interestRate', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
];

const paymentsDialogOpen = ref(false);
const selectedDebt = ref<Debt | null>(null);
const payments = ref<Payment[]>([]);
const paymentsLoading = ref(false);
const paymentsError = ref('');

const paymentDialogOpen = ref(false);
const payForm = ref<CreatePaymentBody>({
  amount: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: '',
});
const paySaving = ref(false);
const payFormError = ref('');

const paymentHeaders = [
  { title: 'Monto', key: 'amount', sortable: false },
  { title: 'Fecha', key: 'paymentDate', sortable: false },
  { title: 'Notas', key: 'notes', sortable: false },
];

const progressPercent = computed(() => {
  if (!selectedDebt.value) return 0;
  const init = Number(selectedDebt.value.initialAmount);
  const curr = Number(selectedDebt.value.currentAmount);
  if (init <= 0) return 0;
  return Math.round(((init - curr) / init) * 100);
});

function priorityLabel(p: string) {
  const map: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };
  return map[p] ?? p;
}

function priorityColor(p: string) {
  const map: Record<string, string> = { low: 'green', medium: 'orange', high: 'red' };
  return map[p] ?? 'grey';
}

function statusLabel(s: string) {
  const map: Record<string, string> = { pending: 'Pendiente', paid: 'Pagada', overdue: 'Vencida' };
  return map[s] ?? s;
}

function statusColor(s: string) {
  const map: Record<string, string> = { pending: 'blue', paid: 'green', overdue: 'red' };
  return map[s] ?? 'grey';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

onMounted(() => {
  store.fetchDebts();
});

function applyFilters() {
  const filters: Record<string, string> = {};
  if (filterStatus.value) filters.status = filterStatus.value;
  if (filterPriority.value) filters.priority = filterPriority.value;
  store.fetchDebts(filters as Record<string, string>);
}

function openCreate() {
  editingId.value = null;
  debtStartDate.value = null;
  form.value = {
    title: '',
    initialAmount: '',
    priority: 'medium',
    interestRate: '',
    minimumPayment: '',
    dueDay: undefined,
    startDate: '',
    description: '',
  };
  formError.value = '';
  dialogOpen.value = true;
}

function openEdit(debt: Debt) {
  editingId.value = debt.id;
  debtStartDate.value = debt.startDate ? new Date(debt.startDate) : null;
  form.value = {
    title: debt.title,
    initialAmount: String(Number(debt.initialAmount)),
    priority: debt.priority,
    interestRate: debt.interestRate ? String(Number(debt.interestRate)) : '',
    minimumPayment: debt.minimumPayment ? String(Number(debt.minimumPayment)) : '',
    dueDay: debt.dueDay ?? undefined,
    startDate: debt.startDate?.slice(0, 10) ?? '',
    description: debt.description ?? '',
    status: debt.status,
  };
  formError.value = '';
  dialogOpen.value = true;
}

function confirmDelete(debt: Debt) {
  deletingItem.value = debt;
  deleteDialogOpen.value = true;
}

async function handleSave() {
  const schema = editingId.value ? updateDebtSchema : createDebtSchema;
  const result = schema.safeParse(
    editingId.value
      ? {
          title: form.value.title,
          initialAmount: form.value.initialAmount,
          priority: form.value.priority,
          interestRate: form.value.interestRate,
          minimumPayment: form.value.minimumPayment,
          dueDay: form.value.dueDay ? Number(form.value.dueDay) : undefined,
          startDate: debtStartDate.value ? debtStartDate.value.toISOString() : undefined,
          description: form.value.description,
          status: form.value.status,
        }
      : {
          title: form.value.title,
          initialAmount: form.value.initialAmount,
          priority: form.value.priority,
          interestRate: form.value.interestRate,
          minimumPayment: form.value.minimumPayment,
          dueDay: form.value.dueDay ? Number(form.value.dueDay) : undefined,
          startDate: debtStartDate.value ? debtStartDate.value.toISOString() : undefined,
          description: form.value.description,
        },
  );
  if (!result.success) {
    formError.value = result.error.issues[0].message;
    return;
  }
  saving.value = true;
  formError.value = '';
  try {
    const payload = result.data as Record<string, unknown>;

    await (editingId.value
      ? store.updateDebt(editingId.value, payload as unknown as UpdateDebtBody)
      : store.createDebt(payload as unknown as CreateDebtBody));
    dialogOpen.value = false;
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ??
      'Error al guardar la deuda';
    formError.value = msg;
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await store.deleteDebt(deletingItem.value.id);
    deleteDialogOpen.value = false;
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ??
      'Error al eliminar la deuda';
    store.error = msg;
  } finally {
    deleting.value = false;
    deletingItem.value = null;
  }
}

async function openPayments(debt: Debt) {
  selectedDebt.value = debt;
  payments.value = [];
  paymentsLoading.value = true;
  paymentsError.value = '';
  paymentsDialogOpen.value = true;
  try {
    payments.value = await store.fetchPayments(debt.id);
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ?? 'Error al cargar pagos';
    paymentsError.value = msg;
  } finally {
    paymentsLoading.value = false;
  }
}

function openPaymentForm() {
  payDate.value = new Date();
  payForm.value = {
    amount: '',
    paymentDate: payDate.value.toISOString().slice(0, 10),
    notes: '',
  };
  payFormError.value = '';
  paymentDialogOpen.value = true;
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

    if (selectedDebt.value) {
      await store.createPayment(selectedDebt.value.id, payload);
      paymentDialogOpen.value = false;
      payments.value = await store.fetchPayments(selectedDebt.value.id);
      await store.fetchDebts();
    }
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
