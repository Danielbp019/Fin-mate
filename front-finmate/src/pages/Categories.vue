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

      <v-btn class="fm-btn-submit" color="var(--green-deep)" prepend-icon="mdi-plus" @click="openCreate">
        Nueva categoría
      </v-btn>
    </div>

    <v-card>
      <v-tabs v-model="tab" color="var(--green-deep)">
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
        <template #loader>
          <LinearLoader :loading="store.loading" />
        </template>

        <template #item.icon="{ item }">
          <v-icon v-if="item.icon" size="24">{{ item.icon }}</v-icon>
          <span v-else class="text-caption text-disabled">&mdash;</span>
        </template>

        <template #item.type="{ item }">
          <v-chip :color="item.type === 'income' ? 'green' : 'orange'" size="small">
            {{ item.type === 'income' ? 'Ingreso' : 'Gasto' }}
          </v-chip>
        </template>

        <template #item.isSystem="{ item }">
          <v-chip v-if="item.isSystem" color="blue" size="small" variant="tonal"> Sistema </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip location="top" :text="item.isSystem ? 'No se puede editar' : 'Editar categoría'">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :disabled="item.isSystem"
                icon
                size="small"
                variant="text"
                @click="openEdit(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip location="top" :text="item.isSystem ? 'No se puede eliminar' : 'Eliminar categoría'">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                :disabled="item.isSystem"
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

    <CategoryDialog
      v-model="dialogOpen"
      :form-error="formError"
      :icon="form.icon ?? ''"
      :is-editing="!!editingId"
      :name="form.name"
      :saving="saving"
      :type="form.type"
      @save="handleSave"
      @update:form-error="formError = $event"
      @update:icon="form.icon = $event"
      @update:name="form.name = $event"
      @update:type="form.type = $event as 'income' | 'expense'"
    />

    <ConfirmDeleteDialog
      v-model="deleteDialogOpen"
      :item-name="deletingItem?.name"
      :loading="deleting"
      title="Eliminar categoría"
      @confirm="handleDelete"
    >
      <template #message>
        <p v-if="deletingItem?.isSystem" class="mt-2 text-caption text-red">
          Las categorías del sistema no pueden eliminarse.
        </p>
      </template>
    </ConfirmDeleteDialog>
  </div>
</template>

<script lang="ts" setup>
import type { Category, CreateCategoryBody, UpdateCategoryBody } from '@/types';
import type { AxiosError } from 'axios';
import { computed, onMounted, ref } from 'vue';
import CategoryDialog from '@/components/CategoryDialog.vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import LinearLoader from '@/components/LinearLoader.vue';
import { useCategoriesStore } from '@/stores/categories';
import { createCategorySchema, updateCategorySchema } from '@/validation';
import '@/styles/auth.css';

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
});

const headers = [
  { title: 'Nombre', key: 'name', align: 'start' as const },
  { title: 'Icono', key: 'icon', sortable: false, align: 'center' as const },
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
  form.value = { name: '', type: 'expense', icon: '' };
  formError.value = '';
  dialogOpen.value = true;
}

function openEdit(cat: Category) {
  editingId.value = cat.id;
  form.value = {
    name: cat.name,
    type: cat.type,
    icon: cat.icon ?? '',
  };
  formError.value = '';
  dialogOpen.value = true;
}

function confirmDelete(cat: Category) {
  deletingItem.value = cat;
  deleteDialogOpen.value = true;
}

async function handleSave() {
  const schema = editingId.value ? updateCategorySchema : createCategorySchema;
  const result = schema.safeParse(form.value);
  if (!result.success) {
    formError.value = result.error.issues[0].message;
    return;
  }
  saving.value = true;
  formError.value = '';
  try {
    const payload = result.data as CreateCategoryBody;

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
