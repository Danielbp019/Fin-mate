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

        <template #item.initialAmount="{ item }">
          {{ formatCurrency(item.initialAmount) }}
        </template>

        <template #item.currentAmount="{ item }">
          <span :style="{ color: Number(item.currentAmount) > 0 ? 'var(--red)' : 'var(--green-deep)' }">
            {{ formatCurrency(item.currentAmount) }}
          </span>
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

        <template #item.remainingDays="{ item }">
          <span v-if="item.dueDate">{{ calcRemainingDays(item.dueDate) }}</span>
          <span v-else class="text-caption text-disabled">N/A</span>
        </template>

        <template #item.interestRate="{ item }">
          <span v-if="item.interestRate">{{ formatInterestRate(item.interestRate) }}<span class="text-caption text-disabled">/{{ item.interestRateType === 'monthly' ? 'mes' : 'anual' }}</span></span>
          <span v-else class="text-caption text-disabled">&mdash;</span>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip location="top" text="Ver plan de pago">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="text" @click="openPayoffPlan(item)">
                <v-icon>mdi-lightbulb-on-outline</v-icon>
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

          <v-tooltip location="top" text="Editar deuda">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="text" @click="openEdit(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip location="top" text="Eliminar deuda">
            <template #activator="{ props }">
              <v-btn v-bind="props" color="error" icon size="small" variant="text" @click="confirmDelete(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <DebtDialogsForm
      v-model="dialogOpen"
      :description="form.description"
      :due-date="debtDueDate"
      :form-error="formError"
      :initial-amount="form.initialAmount"
      :interest-rate="form.interestRate"
      :interest-rate-type="form.interestRateType ?? 'annual'"
      :is-editing="!!editingId"
      :minimum-payment="form.minimumPayment"
      :priority="form.priority ?? 'medium'"
      :saving="saving"
      :start-date="debtStartDate"
      :status="form.status"
      :title="form.title"
      @save="handleSave"
      @update:description="form.description = $event"
      @update:due-date="debtDueDate = $event ?? null"
      @update:form-error="formError = $event"
      @update:initial-amount="form.initialAmount = $event"
      @update:interest-rate="form.interestRate = $event"
      @update:interest-rate-type="form.interestRateType = $event as 'annual' | 'monthly'"
      @update:minimum-payment="form.minimumPayment = $event"
      @update:priority="form.priority = $event as 'low' | 'medium' | 'high'"
      @update:start-date="debtStartDate = $event ?? null"
      @update:status="form.status = $event as 'pending' | 'paid' | 'overdue'"
      @update:title="form.title = $event"
    />

    <DebtDialogsPayments
      v-model="paymentsDialogOpen"
      :current-amount="selectedDebt?.currentAmount ?? '0'"
      :debt-id="selectedDebt?.id ?? ''"
      :debt-title="selectedDebt?.title ?? ''"
      :error="paymentsError"
      :initial-amount="selectedDebt?.initialAmount ?? '0'"
      :loading="paymentsLoading"
      :payments="payments"
      @update:error="paymentsError = $event"
    />

    <ConfirmDeleteDialog
      v-model="deleteDialogOpen"
      :item-name="deletingItem?.title"
      :loading="deleting"
      title="Eliminar deuda"
      @confirm="handleDelete"
    >
      <template #message>
        <p class="mt-2 text-caption">Esta acción no elimina los pagos registrados.</p>
      </template>
    </ConfirmDeleteDialog>

    <DebtPayoffModal
      v-model:dialog="payoffDialog"
      :debt="payoffDebt"
    />
  </div>
</template>

<script lang="ts" setup>
import type { CreateDebtBody, Debt, Payment, UpdateDebtBody } from '@/types';
import type { AxiosError } from 'axios';
import { onMounted, ref, watch } from 'vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import DebtPayoffModal from '@/components/DebtDialogs/DebtPayoffModal.vue';
import DebtDialogsForm from '@/components/DebtDialogs/FormDialog.vue';
import DebtDialogsPayments from '@/components/DebtDialogs/PaymentsDialog.vue';
import LinearLoader from '@/components/LinearLoader.vue';
import { useDebtsStore } from '@/stores/debts';
import { formatCurrency, formatInterestRate } from '@/utils/format';
import { createDebtSchema, updateDebtSchema } from '@/validation';
import '@/styles/auth.css';

function calcRemainingDays(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '0 días';
  return `${diff} días`;
}

interface DebtForm {
  title: string;
  description?: string;
  initialAmount: string;
  interestRate?: string;
  interestRateType?: 'annual' | 'monthly';
  minimumPayment?: string;
  dueDate?: string;
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
const debtDueDate = ref<Date | null>(null);

const payoffDialog = ref(false);
const payoffDebt = ref<Debt | null>(null);

watch(debtStartDate, (d) => {
  form.value.startDate = d ? d.toISOString() : '';
});

watch(debtDueDate, (d) => {
  form.value.dueDate = d ? d.toISOString() : '';
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
  interestRateType: 'annual',
  minimumPayment: '',
  dueDate: '',
  startDate: '',
  description: '',
});

const priorityOptions = [
  { title: 'Baja', value: 'low' },
  { title: 'Media', value: 'medium' },
  { title: 'Alta', value: 'high' },
];



const headers = [
  { title: 'Título', key: 'title', align: 'start' as const },
  { title: 'Monto inicial', key: 'initialAmount', sortable: false },
  { title: 'Monto actual', key: 'currentAmount', sortable: false },
  { title: 'Prioridad', key: 'priority', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Días restantes', key: 'remainingDays', sortable: false },
  { title: 'Interés %', key: 'interestRate', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
];

const paymentsDialogOpen = ref(false);
const selectedDebt = ref<Debt | null>(null);
const payments = ref<Payment[]>([]);
const paymentsLoading = ref(false);
const paymentsError = ref('');

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
  debtDueDate.value = null;
  form.value = {
    title: '',
    initialAmount: '',
    priority: 'medium',
    interestRate: '',
    interestRateType: 'annual',
    minimumPayment: '',
    dueDate: '',
    startDate: '',
    description: '',
  };
  formError.value = '';
  dialogOpen.value = true;
}

function openEdit(debt: Debt) {
  editingId.value = debt.id;
  debtStartDate.value = debt.startDate ? new Date(debt.startDate) : null;
  debtDueDate.value = debt.dueDate ? new Date(debt.dueDate) : null;
  form.value = {
    title: debt.title,
    initialAmount: String(Number(debt.initialAmount)),
    priority: debt.priority,
    interestRate: debt.interestRate ? String(Number(debt.interestRate)) : '',
    interestRateType: debt.interestRateType,
    minimumPayment: debt.minimumPayment ? String(Number(debt.minimumPayment)) : '',
    dueDate: debt.dueDate?.slice(0, 10) ?? '',
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
          interestRateType: form.value.interestRateType,
          minimumPayment: form.value.minimumPayment,
          dueDate: debtDueDate.value ? debtDueDate.value.toISOString() : undefined,
          startDate: debtStartDate.value ? debtStartDate.value.toISOString() : undefined,
          description: form.value.description,
          status: form.value.status,
        }
      : {
          title: form.value.title,
          initialAmount: form.value.initialAmount,
          priority: form.value.priority,
          interestRate: form.value.interestRate,
          interestRateType: form.value.interestRateType,
          minimumPayment: form.value.minimumPayment,
          dueDate: debtDueDate.value ? debtDueDate.value.toISOString() : undefined,
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

function openPayoffPlan(debt: Debt) {
  payoffDebt.value = debt;
  payoffDialog.value = true;
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
</script>
