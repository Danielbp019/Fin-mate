<template>
  <div class="dashboard-container">
    <div
      class="dashboard-greeting"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>
        <h1>Categorías</h1>
        <p>Administra tus categorías de ingresos y gastos</p>
      </div>
      <v-btn class="fm-btn-submit" color="#0F6E56" prepend-icon="mdi-plus" @click="openCreate">
        Nueva categoría
      </v-btn>
    </div>

    <v-card>
      <v-tabs v-model="tab" color="#0F6E56">
        <v-tab value="all">Todas</v-tab>
        <v-tab value="income">Ingresos</v-tab>
        <v-tab value="expense">Gastos</v-tab>
      </v-tabs>

      <v-alert
        v-if="store.error"
        class="ma-4"
        closable
        density="compact"
        rounded="lg"
        type="error"
        variant="tonal"
        @click:close="store.error = ''"
      >
        {{ store.error }}
      </v-alert>

      <v-data-table
        class="pa-2"
        :headers="headers"
        hide-default-footer
        :items="filteredCategories"
        :items-per-page="-1"
        :loading="store.loading"
      >
        <template #item.type="{ item }">
          <v-chip :color="item.type === 'income' ? 'green' : 'orange'" size="small">
            {{ item.type === 'income' ? 'Ingreso' : 'Gasto' }}
          </v-chip>
        </template>
        <template #item.isSystem="{ item }">
          <v-chip v-if="item.isSystem" color="blue" size="small" variant="tonal"> Sistema </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn
            :disabled="item.isSystem"
            icon
            size="small"
            :title="item.isSystem ? 'No se puede editar' : 'Editar'"
            variant="text"
            @click="openEdit(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            color="error"
            :disabled="item.isSystem"
            icon
            size="small"
            :title="item.isSystem ? 'No se puede eliminar' : 'Eliminar'"
            variant="text"
            @click="confirmDelete(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="500">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">
          {{ editingId ? 'Editar categoría' : 'Nueva categoría' }}
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
              <label class="fm-label">Nombre</label>
              <v-text-field
                v-model="form.name"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                placeholder="Ej: Salario"
                required
                rounded="lg"
                variant="outlined"
              />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Tipo</label>
              <v-select
                v-model="form.type"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                :items="typeOptions"
                required
                rounded="lg"
                variant="outlined"
              />
            </div>

            <div class="fm-field-row">
              <div class="fm-field-group">
                <label class="fm-label">Icono (opcional)</label>
                <v-text-field
                  v-model="form.icon"
                  class="fm-input"
                  density="comfortable"
                  hide-details="auto"
                  placeholder="mdi-food"
                  rounded="lg"
                  variant="outlined"
                />
              </div>
              <div class="fm-field-group">
                <label class="fm-label">Color (opcional)</label>
                <v-text-field
                  v-model="form.color"
                  class="fm-input"
                  density="comfortable"
                  hide-details="auto"
                  placeholder="#FF5733"
                  rounded="lg"
                  variant="outlined"
                />
              </div>
            </div>

            <v-btn
              block
              class="fm-btn-submit mt-2"
              :loading="saving"
              rounded="lg"
              size="large"
              type="submit"
            >
              {{ editingId ? 'Guardar cambios' : 'Crear categoría' }}
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
        <v-card-title class="text-h5 font-weight-bold pa-4">Eliminar categoría</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <p>
            ¿Estás seguro de eliminar la categoría <strong>{{ deletingItem?.name }}</strong
            >?
          </p>
          <p v-if="deletingItem?.isSystem" class="mt-2 text-caption text-red">
            Las categorías del sistema no pueden eliminarse.
          </p>
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
  </div>
</template>

<script lang="ts" setup>
import type { AxiosError } from 'axios';
import type { Category, CreateCategoryBody, UpdateCategoryBody } from '@/types';
import { computed, onMounted, ref } from 'vue';
import { useCategoriesStore } from '@/stores/categories';
import '@/styles/theme.css';

const store = useCategoriesStore();

const tab = ref<'all' | 'income' | 'expense'>('all');
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const deleting = ref(false);
const deletingItem = ref<Category | null>(null);
const formError = ref('');
const form = ref<CreateCategoryBody>({
  name: '',
  type: 'expense',
  icon: '',
  color: '',
});

const typeOptions = [
  { title: 'Ingreso', value: 'income' },
  { title: 'Gasto', value: 'expense' },
];

const headers = [
  { title: 'Nombre', key: 'name', align: 'start' as const },
  { title: 'Tipo', key: 'type', sortable: false },
  { title: 'Origen', key: 'isSystem', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
];

const filteredCategories = computed(() => {
  if (tab.value === 'all') return store.categories;
  return store.categories.filter((c) => c.type === tab.value);
});

onMounted(() => {
  store.fetchCategories();
});

function openCreate() {
  editingId.value = null;
  form.value = { name: '', type: 'expense', icon: '', color: '' };
  formError.value = '';
  dialogOpen.value = true;
}

function openEdit(cat: Category) {
  editingId.value = cat.id;
  form.value = {
    name: cat.name,
    type: cat.type,
    icon: cat.icon ?? '',
    color: cat.color ?? '',
  };
  formError.value = '';
  dialogOpen.value = true;
}

function confirmDelete(cat: Category) {
  deletingItem.value = cat;
  deleteDialogOpen.value = true;
}

async function handleSave() {
  if (!form.value.name.trim()) {
    formError.value = 'El nombre es requerido';
    return;
  }
  saving.value = true;
  formError.value = '';
  try {
    const payload: CreateCategoryBody = {
      name: form.value.name.trim(),
      type: form.value.type,
    };
    if (form.value.icon) payload.icon = form.value.icon;
    if (form.value.color) payload.color = form.value.color;

    await (editingId.value
      ? store.updateCategory(editingId.value, payload as UpdateCategoryBody)
      : store.createCategory(payload));
    dialogOpen.value = false;
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ??
      'Error al guardar la categoría';
    formError.value = msg;
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await store.deleteCategory(deletingItem.value.id);
    deleteDialogOpen.value = false;
  } catch (error: unknown) {
    const msg =
      (error as AxiosError<{ error?: string }>).response?.data?.error ??
      'Error al eliminar la categoría';
    store.error = msg;
  } finally {
    deleting.value = false;
    deletingItem.value = null;
  }
}
</script>
