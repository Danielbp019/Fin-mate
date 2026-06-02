<template>
  <div class="dashboard-container">
    <div class="dashboard-greeting" style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h1>Movimientos</h1>
        <p>Registra y administra tus ingresos y gastos</p>
      </div>
      <v-btn class="fm-btn-submit" color="#0F6E56" prepend-icon="mdi-plus" @click="openCreate">
        Nuevo movimiento
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text class="pa-4">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <v-tabs v-model="filterType" color="#0F6E56" density="compact" hide-slider>
            <v-tab value="">Todos</v-tab>
            <v-tab value="income">Ingresos</v-tab>
            <v-tab value="expense">Gastos</v-tab>
          </v-tabs>

          <v-select v-model="filterCategoryId" class="fm-input" clearable density="compact" hide-details="auto"
            :items="categoryOptions" placeholder="Categoría" rounded="lg" style="min-width:160px" variant="outlined" />

          <v-text-field v-model="filterFrom" class="fm-input" density="compact" hide-details="auto" placeholder="Desde"
            rounded="lg" style="min-width:140px" type="date" variant="outlined" />

          <v-text-field v-model="filterTo" class="fm-input" density="compact" hide-details="auto" placeholder="Hasta"
            rounded="lg" style="min-width:140px" type="date" variant="outlined" />

          <v-btn rounded="lg" variant="tonal" @click="applyFilters">
            <v-icon>mdi-magnify</v-icon> Filtrar
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-alert v-if="store.error" class="mb-4" closable density="compact" rounded="lg" type="error" variant="tonal"
      @click:close="store.error = ''">
      {{ store.error }}
    </v-alert>

    <v-card>
      <v-data-table class="pa-2" :headers="headers" hide-default-footer :items="store.movements" :items-per-page="-1"
        :loading="store.loading">
        <template #item.movementDate="{ item }">
          {{ formatDate(item.movementDate) }}
        </template>
        <template #item.type="{ item }">
          <v-icon :color="item.type === 'income' ? 'green' : 'orange'">
            {{ item.type === 'income' ? 'mdi-trending-up' : 'mdi-trending-down' }}
          </v-icon>
        </template>
        <template #item.categoryId="{ item }">
          {{ getCategoryName(item.categoryId) }}
        </template>
        <template #item.amount="{ item }">
          <span :class="item.type === 'income' ? 'green--text' : 'orange--text'" style="font-weight:600">
            {{ formatAmount(item) }}
          </span>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" title="Editar" variant="text" @click="openEdit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn color="error" icon size="small" title="Eliminar" variant="text" @click="confirmDelete(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-divider v-if="store.pagination.total > 0" />

      <div v-if="store.pagination.total > 0" class="d-flex align-center justify-center pa-4 ga-2">
        <v-btn :disabled="store.pagination.page <= 1" variant="text" @click="store.setPage(store.pagination.page - 1)">
          <v-icon>mdi-chevron-left</v-icon> Anterior
        </v-btn>
        <span class="text-caption" style="color:rgba(var(--v-theme-on-surface),0.6)">
          Página {{ store.pagination.page }} de {{ totalPages }} ({{ store.pagination.total }} registros)
        </span>
        <v-btn :disabled="store.pagination.page >= totalPages" variant="text"
          @click="store.setPage(store.pagination.page + 1)">
          Siguiente <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="520">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">
          {{ editingId ? 'Editar movimiento' : 'Nuevo movimiento' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-alert v-if="formError" class="mb-4" closable density="compact" rounded="lg" type="error" variant="tonal"
            @click:close="formError = ''">
            {{ formError }}
          </v-alert>

          <v-form @submit.prevent="handleSave">
            <div class="fm-field-group">
              <label class="fm-label">Tipo</label>
              <v-select v-model="form.type" class="fm-input" density="comfortable" hide-details="auto"
                :items="typeOptions" required rounded="lg" variant="outlined"
                @update:model-value="form.categoryId = ''" />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Categoría</label>
              <v-select v-model="form.categoryId" class="fm-input" density="comfortable" hide-details="auto"
                item-title="name" item-value="id" :items="availableCategories" required rounded="lg"
                variant="outlined" />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Monto</label>
              <v-text-field v-model="form.amount" class="fm-input" density="comfortable" hide-details="auto" min="0"
                placeholder="0.00" required rounded="lg" step="0.01" type="number" variant="outlined" />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Fecha</label>
              <v-text-field v-model="form.movementDate" class="fm-input" density="comfortable" hide-details="auto"
                required rounded="lg" type="date" variant="outlined" />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Descripción (opcional)</label>
              <v-textarea v-model="form.description" class="fm-input" density="comfortable" hide-details="auto"
                maxlength="255" placeholder="Agrega una nota" rounded="lg" rows="2" variant="outlined" />
            </div>

            <v-btn block class="fm-btn-submit mt-2" :loading="saving" rounded="lg" size="large" type="submit">
              {{ editingId ? 'Guardar cambios' : 'Crear movimiento' }}
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
        <v-card-title class="text-h5 font-weight-bold pa-4">Eliminar movimiento</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <p>¿Estás seguro de eliminar este movimiento?</p>
          <p class="mt-2 text-caption">
            {{ getCategoryName(deletingItem?.categoryId ?? '') }} —
            {{ formatAmount(deletingItem) }}
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="deleteDialogOpen = false">Cancelar</v-btn>
          <v-btn color="error" :loading="deleting" rounded="lg" variant="tonal" @click="handleDelete">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import type { AxiosError } from 'axios'
import type { CreateMovementBody, Movement, UpdateMovementBody } from '@/types'
import { computed, onMounted, ref, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useMovementsStore } from '@/stores/movements'
import '@/styles/theme.css'

const catStore = useCategoriesStore()
const store = useMovementsStore()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const deleting = ref(false)
const deletingItem = ref<Movement | null>(null)
const formError = ref('')

const filterType = ref('')
const filterCategoryId = ref('')
const filterFrom = ref('')
const filterTo = ref('')

const form = ref<CreateMovementBody>({
  categoryId: '',
  type: 'expense',
  amount: '',
  description: '',
  movementDate: new Date().toISOString().slice(0, 10),
})

const typeOptions = [
  { title: 'Ingreso', value: 'income' },
  { title: 'Gasto', value: 'expense' },
]

const headers = [
  { title: 'Fecha', key: 'movementDate', sortable: false },
  { title: '', key: 'type', sortable: false, width: '40px' },
  { title: 'Categoría', key: 'categoryId', sortable: false },
  { title: 'Monto', key: 'amount', sortable: false },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const categoryOptions = computed(() => {
  const cats = catStore.categories.filter(c => c.isActive)
  return cats.map(c => ({
    title: c.name,
    value: c.id,
  }))
})

const availableCategories = computed(() => {
  if (!form.value.type) return catStore.expenseCategories
  return form.value.type === 'income'
    ? catStore.incomeCategories
    : catStore.expenseCategories
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(store.pagination.total / store.pagination.limit)),
)

function getCategoryName(id: string) {
  return catStore.getCategoryById(id)?.name ?? id
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatAmount(item: Movement | null | undefined) {
  if (!item) return ''
  const prefix = item.type === 'income' ? '+' : '-'
  return `${prefix}$${Number(item.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

onMounted(() => {
  catStore.fetchCategories()
  store.fetchMovements({ page: 1, limit: 20 })
})

watch(filterType, () => {
  filterCategoryId.value = ''
})

function applyFilters() {
  const filters: Record<string, string> = {}
  if (filterType.value) filters.type = filterType.value
  if (filterCategoryId.value) filters.categoryId = filterCategoryId.value
  if (filterFrom.value) filters.from = new Date(filterFrom.value).toISOString()
  if (filterTo.value)
    filters.to = new Date(filterTo.value + 'T23:59:59').toISOString()
  store.setFilters(filters)
}

function openCreate() {
  editingId.value = null
  form.value = {
    categoryId: '',
    type: 'expense',
    amount: '',
    description: '',
    movementDate: new Date().toISOString().slice(0, 10),
  }
  formError.value = ''
  dialogOpen.value = true
}

function openEdit(mov: Movement) {
  editingId.value = mov.id
  form.value = {
    categoryId: mov.categoryId,
    type: mov.type,
    amount: mov.amount,
    description: mov.description ?? '',
    movementDate: mov.movementDate.slice(0, 10),
  }
  formError.value = ''
  dialogOpen.value = true
}

function confirmDelete(mov: Movement) {
  deletingItem.value = mov
  deleteDialogOpen.value = true
}

async function handleSave() {
  if (!form.value.categoryId) {
    formError.value = 'Selecciona una categoría'
    return
  }
  if (!form.value.amount || Number(form.value.amount) <= 0) {
    formError.value = 'Ingresa un monto válido'
    return
  }
  if (!form.value.movementDate) {
    formError.value = 'Selecciona una fecha'
    return
  }

  saving.value = true
  formError.value = ''
  try {
    const payload: CreateMovementBody = {
      categoryId: form.value.categoryId,
      type: form.value.type,
      amount: form.value.amount,
      movementDate: new Date(form.value.movementDate + 'T12:00:00').toISOString(),
    }
    if (form.value.description) payload.description = form.value.description.trim()

    await (editingId.value ? store.updateMovement(editingId.value, payload as UpdateMovementBody) : store.createMovement(payload))
    dialogOpen.value = false
    store.fetchMovements()
  } catch (error: unknown) {
    const msg
      = (error as AxiosError<{ error?: string }>).response?.data?.error
      ?? 'Error al guardar el movimiento'
    formError.value = msg
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  try {
    await store.deleteMovement(deletingItem.value.id)
    deleteDialogOpen.value = false
    store.fetchMovements()
  } catch (error: unknown) {
    const msg
      = (error as AxiosError<{ error?: string }>).response?.data?.error
      ?? 'Error al eliminar el movimiento'
    store.error = msg
  } finally {
    deleting.value = false
    deletingItem.value = null
  }
}
</script>
