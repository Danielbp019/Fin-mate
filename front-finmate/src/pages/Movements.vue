<template>
  <div class="dashboard-container">
    <div
      class="dashboard-greeting"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>
        <h1>Movimientos</h1>
        <p>Registra y administra tus ingresos y gastos</p>
      </div>

      <v-btn class="fm-btn-submit" color="var(--green-deep)" prepend-icon="mdi-plus" @click="openCreate">
        Nuevo movimiento
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text class="pa-4">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
          <v-tabs v-model="filterType" color="var(--green-deep)" density="compact" hide-slider>
            <v-tab value="">Todos</v-tab>
            <v-tab value="income">Ingresos</v-tab>
            <v-tab value="expense">Gastos</v-tab>
          </v-tabs>

          <v-select
            v-model="filterCategoryId"
            aria-label="Categoría"
            class="fm-input"
            clearable
          density="compact"
          hide-details="auto"
          :items="categoryOptions"
          placeholder="Categoría"
          rounded="lg"
          style="min-width: 160px"
          variant="outlined"
        />

        <label class="fm-label" for="filter-from" style="margin-bottom: 0">Desde:</label>
        <DatePicker id="filter-from" v-model="filterFrom" aria-label="Desde" density="compact" placeholder="Desde" />
        <label class="fm-label" for="filter-to" style="margin-bottom: 0">Hasta:</label>
        <DatePicker id="filter-to" v-model="filterTo" aria-label="Hasta" density="compact" placeholder="Hasta" />
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
        :items="store.movements"
        :items-per-page="-1"
        :loading="store.loading"
      >
        <template #loader>
          <LinearLoader :loading="store.loading" />
        </template>

        <template #item.movementDate="{ item }">
          {{ formatDate(item.movementDate) }}
        </template>

        <template #item.type="{ item }">
          <div class="d-flex align-center ga-1">
            <v-icon :color="item.type === 'income' ? 'green' : 'orange'">
              {{ item.type === 'income' ? 'mdi-trending-up' : 'mdi-trending-down' }}
            </v-icon>

            <span>{{ item.type === 'income' ? 'Ingreso' : 'Gasto' }}</span>
          </div>
        </template>

        <template #item.categoryId="{ item }">
          <div style="display: flex; align-items: center; gap: 8px">
            <v-icon v-if="getCategoryIcon(item.categoryId)" size="22">
              {{ getCategoryIcon(item.categoryId) }}
            </v-icon>

            <span>{{ getCategoryName(item.categoryId) }}</span>

            <v-chip
              v-if="item.referenceType === 'debt_payment'"
              color="orange"
              size="x-small"
              variant="tonal"
            >
              Deuda
            </v-chip>

            <v-chip
              v-else-if="item.referenceType === 'goal_contribution'"
              color="green"
              size="x-small"
              variant="tonal"
            >
              Meta Pareja
            </v-chip>
          </div>
        </template>

        <template #item.amount="{ item }">
          <span
            :class="item.type === 'income' ? 'green--text' : 'orange--text'"
            style="font-weight: 600"
          >
            {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <template v-if="item.referenceType !== 'goal_contribution' && item.referenceType !== 'debt_payment'">
            <v-tooltip location="top" text="Editar movimiento">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" @click="openEdit(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip location="top" text="Eliminar movimiento">
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
        </template>
      </v-data-table>

      <v-divider v-if="store.pagination.total > 0" />

      <div v-if="store.pagination.total > 0" class="d-flex align-center justify-center pa-4 ga-2">
        <v-tooltip location="top" text="Página anterior">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :disabled="store.pagination.page <= 1"
              variant="text"
              @click="store.setPage(store.pagination.page - 1)"
            >
              <v-icon>mdi-chevron-left</v-icon> Anterior
            </v-btn>
          </template>
        </v-tooltip>

        <span class="text-caption text-87">
          Página {{ store.pagination.page }} de {{ totalPages }} ({{ store.pagination.total }}
          registros)
        </span>

        <v-tooltip location="top" text="Página siguiente">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :disabled="store.pagination.page >= totalPages"
              variant="text"
              @click="store.setPage(store.pagination.page + 1)"
            >
              Siguiente <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </v-card>

    <MovementDialog
      v-model="dialogOpen"
      :amount="form.amount"
      :available-categories="availableCategories"
      :category-id="form.categoryId"
      :description="form.description ?? ''"
      :form-error="formError"
      :is-editing="!!editingId"
      :movement-date="formDate"
      :saving="saving"
      :type="form.type"
      @save="handleSave"
      @update:amount="form.amount = $event"
      @update:category-id="form.categoryId = $event"
      @update:description="form.description = $event"
      @update:form-error="formError = $event"
      @update:movement-date="formDate = $event; form.movementDate = $event.toISOString().slice(0, 10)"
      @update:type="form.type = $event as 'income' | 'expense'; form.categoryId = null"
    />

    <ConfirmDeleteDialog
      v-model="deleteDialogOpen"
      :loading="deleting"
      title="Eliminar movimiento"
      @confirm="handleDelete"
    >
      <template #message>
        <p>¿Estás seguro de eliminar este movimiento?</p>

        <p class="mt-2 text-caption">
          {{ getCategoryName(deletingItem?.categoryId ?? '') }} con un
          {{ deletingItem ? (deletingItem.type === 'income' ? 'Ingreso de ' : 'Gasto de ') + formatCurrency(deletingItem.amount) : '' }}
        </p>
      </template>
    </ConfirmDeleteDialog>
  </div>
</template>

<script lang="ts" setup>
import type { CreateMovementBody, Movement, UpdateMovementBody } from '@/types';
import type { AxiosError } from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import DatePicker from '@/components/DatePicker.vue';
import LinearLoader from '@/components/LinearLoader.vue';
import MovementDialog from '@/components/MovementDialog.vue';
import { useCategoriesStore } from '@/stores/categories';
import { useMovementsStore } from '@/stores/movements';
import { formatCurrency } from '@/utils/format';
import { createMovementSchema, updateMovementSchema } from '@/validation';
import '@/styles/auth.css';

const catStore = useCategoriesStore();
const store = useMovementsStore();

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const deleting = ref(false);
const deletingItem = ref<Movement | null>(null);
const formError = ref('');

const filterType = ref('');
const filterCategoryId = ref<string | null>(null);
const filterFrom = ref<Date | null>(null);
const filterTo = ref<Date | null>(null);

const formDate = ref(new Date());

const form = ref<CreateMovementBody>({
  categoryId: null,
  type: 'expense',
  amount: '',
  description: '',
  movementDate: new Date().toISOString().slice(0, 10),
});

const headers = [
  { title: 'Fecha', key: 'movementDate', sortable: false },
  { title: 'Tipo', key: 'type', sortable: false },
  { title: 'Categoría', key: 'categoryId', sortable: false },
  { title: 'Monto', key: 'amount', sortable: false },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
];

const categoryOptions = computed(() => {
  return catStore.categories
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      title: c.name,
      value: c.id,
    }));
});

const AUTO_MANAGED_CATEGORIES = new Set([
  'Ahorro Meta de Pareja',
  'Devolucion Meta de Pareja',
  'Pago de Deuda',
]);

const availableCategories = computed(() => {
  const cats = form.value.type
    ? form.value.type === 'income'
      ? catStore.incomeCategories
      : catStore.expenseCategories
    : catStore.expenseCategories;
  return [...cats]
    .filter((c) => !AUTO_MANAGED_CATEGORIES.has(c.name))
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ title: c.name, value: c.id }));
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(store.pagination.total / store.pagination.limit)),
);

function getCategoryName(id: string) {
  return catStore.getCategoryById(id)?.name ?? id;
}

function getCategoryIcon(id: string) {
  return catStore.getCategoryById(id)?.icon ?? null;
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
  catStore.fetchCategories();
  store.fetchMovements({ page: 1, limit: 20 });
});

watch(filterType, () => {
  filterCategoryId.value = null;
});

watch(formDate, (d) => {
  form.value.movementDate = d.toISOString().slice(0, 10);
});

let filterTimeout: ReturnType<typeof setTimeout>;

watch([filterType, filterCategoryId, filterFrom, filterTo], () => {
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => applyFilters(), 300);
});

function applyFilters() {
  const filters: Record<string, string> = {};
  if (filterType.value) filters.type = filterType.value;
  if (filterCategoryId.value) filters.categoryId = filterCategoryId.value;
  if (filterFrom.value) filters.from = filterFrom.value.toISOString();
  if (filterTo.value) {
    const endOfDay = new Date(filterTo.value);
    endOfDay.setHours(23, 59, 59, 0);
    filters.to = endOfDay.toISOString();
  }
  store.setFilters(filters);
}

function openCreate() {
  editingId.value = null;
  formDate.value = new Date();
  form.value = {
    categoryId: null,
    type: 'expense',
    amount: '',
    description: '',
    movementDate: formDate.value.toISOString().slice(0, 10),
  };
  formError.value = '';
  dialogOpen.value = true;
}

function openEdit(mov: Movement) {
  if (mov.referenceType === 'goal_contribution' || mov.referenceType === 'debt_payment') return;
  editingId.value = mov.id;
  formDate.value = new Date(mov.movementDate);
  form.value = {
    categoryId: mov.categoryId,
    type: mov.type,
    amount: String(Number(mov.amount)),
    description: mov.description ?? '',
    movementDate: formDate.value.toISOString().slice(0, 10),
  };
  formError.value = '';
  dialogOpen.value = true;
}

function confirmDelete(mov: Movement) {
  if (mov.referenceType === 'goal_contribution' || mov.referenceType === 'debt_payment') return;
  deletingItem.value = mov;
  deleteDialogOpen.value = true;
}

async function handleSave() {
  const schema = editingId.value ? updateMovementSchema : createMovementSchema;
  const result = schema.safeParse({
    categoryId: form.value.categoryId,
    type: form.value.type,
    amount: form.value.amount,
    movementDate: formDate.value.toISOString(),
    description: form.value.description?.trim() || undefined,
  });
  if (!result.success) {
    formError.value = result.error.issues[0].message;
    return;
  }
  saving.value = true;
  formError.value = '';
  try {
    const payload = result.data as CreateMovementBody;

    await (editingId.value
      ? store.updateMovement(editingId.value, payload as UpdateMovementBody)
      : store.createMovement(payload));
    dialogOpen.value = false;
    store.fetchMovements();
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ??
      'Error al guardar el movimiento';
    formError.value = msg;
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await store.deleteMovement(deletingItem.value.id);
    deleteDialogOpen.value = false;
    store.fetchMovements();
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ??
      'Error al eliminar el movimiento';
    store.error = msg;
  } finally {
    deleting.value = false;
    deletingItem.value = null;
  }
}
</script>
