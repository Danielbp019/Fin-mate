<template>
  <div class="dashboard-container">
    <template v-if="!store.couple">
      <!-- Sin grupo -->
      <div class="dashboard-greeting">
        <h1>Mi Pareja</h1>
        <p>Administra tus finanzas en pareja</p>
      </div>

      <v-card>
        <v-card-text class="pa-4">
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

          <h2 class="text-h5 font-weight-bold mb-2">Crear grupo</h2>

          <p class="text-body-2 text-medium-emphasis mb-4">
            Crea un grupo para compartir metas financieras con tu pareja.
          </p>

          <v-form @submit.prevent="handleCreate">
            <v-text-field
              v-model="createForm.name"
              v-capitalize-first
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              placeholder="Nombre del grupo"
              required
              rounded="lg"
              variant="outlined"
            />

            <v-btn
              class="fm-btn-submit mt-3"
              :loading="store.saving"
              rounded="lg"
              size="large"
              type="submit"
            >
              Crear grupo
              <template #loader>
                <v-progress-circular color="white" indeterminate size="20" width="2" />
              </template>
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <h2 class="text-h5 font-weight-bold mb-2">Unirse a un grupo</h2>

          <p class="text-body-2 text-medium-emphasis mb-4">
            Solicita unirte al grupo de tu pareja.
          </p>

          <v-form @submit.prevent="handleInvite">
            <v-text-field
              v-model="inviteEmail"
              class="fm-input"
              density="comfortable"
              hide-details="auto"
              placeholder="Correo de tu pareja"
              required
              rounded="lg"
              type="email"
              variant="outlined"
            />

            <v-alert
              v-if="inviteSuccess"
              class="mt-3"
              closable
              density="compact"
              rounded="lg"
              type="success"
              variant="tonal"
              @click:close="inviteSuccess = false"
            >
              Invitación enviada correctamente
            </v-alert>

            <v-btn
              class="fm-btn-submit mt-3"
              :loading="inviting"
              rounded="lg"
              size="large"
              type="submit"
            >
              Invitar
              <template #loader>
                <v-progress-circular color="white" indeterminate size="20" width="2" />
              </template>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </template>

    <template v-else>
      <!-- Con grupo -->
      <div
        class="dashboard-greeting"
        style="display: flex; align-items: center; justify-content: space-between"
      >
        <div>
          <h1>{{ store.couple.name }}</h1>
          <p>Administra las metas financieras de tu grupo</p>
        </div>

        <div style="display: flex; gap: 8px">
          <v-btn variant="text" @click="openEditName">
            <v-icon start>mdi-pencil</v-icon>
            Editar nombre
          </v-btn>

          <v-btn v-if="isOwner" color="error" variant="tonal" @click="confirmDissolve = true">
            Disolver
          </v-btn>

          <v-btn color="error" variant="tonal" @click="confirmLeave = true">
            Abandonar
          </v-btn>
        </div>
      </div>

      <!-- Miembros -->
      <v-card class="mb-4">
        <v-card-title class="text-h6 font-weight-bold pa-4 pb-0">Miembros</v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <v-col
              v-for="member in store.couple.members"
              :key="member.id"
              cols="12"
              sm="6"
            >
              <v-card class="summary-card" variant="tonal">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3">
                    <v-avatar color="var(--green-deep)" size="40">
                      <span class="text-white font-weight-bold">{{ member.name.charAt(0).toUpperCase() }}</span>
                    </v-avatar>

                    <div>
                      <div style="font-weight: 600">{{ member.name }}</div>

                      <div class="text-caption text-medium-emphasis">
                        {{ member.role === 'owner' ? 'Propietario' : 'Miembro' }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Metas -->
      <div
        class="mt-6 mb-3"
        style="display: flex; align-items: center; justify-content: space-between"
      >
        <h2 class="text-h5 font-weight-bold">Metas compartidas</h2>

        <v-btn
          class="fm-btn-submit"
          color="var(--green-deep)"
          prepend-icon="mdi-plus"
          @click="openCreateGoal"
        >
          Nueva meta
        </v-btn>
      </div>

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

      <div v-if="store.goals.length === 0" class="text-center pa-8">
        <v-icon size="48" style="opacity: 0.4">mdi-flag-outline</v-icon>
        <p class="mt-2 text-medium-emphasis">No hay metas aún. ¡Crea tu primera meta!</p>
      </div>

      <div v-for="goal in store.goals" :key="goal.id" class="mb-3">
        <v-card class="summary-card" variant="tonal">
          <v-card-text class="pa-4">
            <div style="display: flex; justify-content: space-between; align-items: start">
              <div style="flex: 1">
                <div class="text-h6 font-weight-bold">{{ goal.title }}</div>

                <div class="mt-2">
                  <div class="d-flex align-center ga-2">
                    <span class="text-caption text-medium-emphasis">
                      {{ formatCurrency(goal.currentAmount) }} / {{ formatCurrency(goal.targetAmount) }}
                    </span>

                    <v-chip size="x-small" variant="tonal">
                      {{ Math.round(goalProgress(goal)) }}%
                    </v-chip>
                  </div>

                  <v-progress-linear
                    class="mt-1"
                    color="var(--green-deep)"
                    height="8"
                    :model-value="goalProgress(goal)"
                    rounded
                  />
                </div>

                <div class="mt-1 d-flex ga-3 text-caption text-medium-emphasis">
                  <span v-if="goal.deadline">
                    <v-icon size="14">mdi-calendar</v-icon>
                    {{ formatDate(goal.deadline) }}
                  </span>

                  <span>
                    <v-icon size="14">mdi-account-group</v-icon>
                    {{ goal.contributions.length }} aporte(s)
                  </span>
                </div>
              </div>

              <div class="d-flex ga-1">
                <v-tooltip location="top" text="Contribuir">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon size="small" variant="text" @click="openContribute(goal)">
                      <v-icon>mdi-plus-circle-outline</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip location="top" text="Ver aportes">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon size="small" variant="text" @click="openSummary(goal)">
                      <v-icon>mdi-chart-bar</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip location="top" text="Editar meta">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon size="small" variant="text" @click="openEditGoal(goal)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip location="top" text="Eliminar meta">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" color="error" icon size="small" variant="text" @click="confirmDeleteGoal = goal">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>

    <CoupleDialogsEditName
      v-model="editNameDialog"
      :error="editNameError"
      :loading="store.saving"
      :name="editNameForm.name"
      @save="handleEditName"
      @update:error="editNameError = $event"
      @update:name="editNameForm.name = $event"
    />

    <CoupleDialogsGoal
      v-model="goalDialog"
      :deadline="goalDeadline"
      :error="goalFormError"
      :is-editing="!!editingGoal"
      :loading="store.saving"
      :target-amount="goalForm.targetAmount"
      :title="goalForm.title"
      @save="handleSaveGoal"
      @update:deadline="goalDeadline = $event"
      @update:error="goalFormError = $event"
      @update:target-amount="goalForm.targetAmount = $event"
      @update:title="goalForm.title = $event"
    />

    <CoupleDialogsContribute
      v-model="contributeDialog"
      :amount="contributeForm.amount"
      :current-amount="contributingGoal?.currentAmount ?? '0'"
      :date="contributeDate"
      :error="contributeError"
      :goal-title="contributingGoal?.title ?? ''"
      :loading="store.saving"
      :notes="contributeForm.notes"
      :target-amount="contributingGoal?.targetAmount ?? '0'"
      @save="handleContribute"
      @update:amount="contributeForm.amount = $event"
      @update:date="contributeDate = $event"
      @update:error="contributeError = $event"
      @update:notes="contributeForm.notes = $event"
    />

    <CoupleDialogsSummary
      v-model="summaryDialog"
      :goal-title="summaryGoal?.title ?? ''"
      :rows="summaryRows"
      :status="summaryGoal?.status"
      :total-amount="summaryGoal?.currentAmount ?? '0'"
    />

    <ConfirmDeleteDialog
      v-model="confirmDissolve"
      action-text="disolver"
      confirm-text="Disolver"
      :item-name="store.couple?.name"
      :loading="store.saving"
      title="Disolver grupo"
      @confirm="handleDissolve"
    >
      <template #message>
        <p>Las metas activas se cancelarán y los registros financieros se desvincularán. Esta acción no se puede deshacer.</p>
      </template>
    </ConfirmDeleteDialog>

    <ConfirmDeleteDialog
      v-model="confirmLeave"
      action-text="abandonar"
      confirm-text="Abandonar"
      :item-name="store.couple?.name"
      :loading="store.saving"
      title="Abandonar grupo"
      @confirm="handleLeave"
    />

    <ConfirmDeleteDialog
      v-model="showDeleteGoal"
      :item-name="confirmDeleteGoal?.title"
      :loading="store.saving"
      title="Eliminar meta"
      @confirm="handleDeleteGoal"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Goal } from '@/types';
import { computed, onMounted, ref, watch } from 'vue';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import CoupleDialogsContribute from '@/components/CoupleDialogs/ContributeDialog.vue';
import CoupleDialogsEditName from '@/components/CoupleDialogs/EditNameDialog.vue';
import CoupleDialogsGoal from '@/components/CoupleDialogs/GoalDialog.vue';
import CoupleDialogsSummary from '@/components/CoupleDialogs/SummaryDialog.vue';
import { useAuthStore } from '@/stores/auth';
import { useCouplesStore } from '@/stores/couples';
import { formatCurrency } from '@/utils/format';
import {
  contributeSchema,
  createCoupleSchema,
  createGoalSchema,
  inviteSchema,
  updateCoupleSchema,
  updateGoalSchema,
} from '@/validation';
import '@/styles/auth.css';

const store = useCouplesStore();
const auth = useAuthStore();

const createForm = ref({ name: '' });
const inviteEmail = ref('');
const inviting = ref(false);
const inviteSuccess = ref(false);

const editNameDialog = ref(false);
const editNameForm = ref({ name: '' });
const editNameError = ref('');

const goalDialog = ref(false);
const editingGoal = ref<Goal | null>(null);
const goalForm = ref({ title: '', targetAmount: '', deadline: '' });
const goalFormError = ref('');

const goalDeadline = ref<Date | null>(null);
const contributeDate = ref(new Date());

watch(goalDeadline, (d) => {
  goalForm.value.deadline = d ? d.toISOString().slice(0, 10) : '';
});

watch(contributeDate, (d) => {
  contributeForm.value.date = d.toISOString().slice(0, 10);
});

const contributeDialog = ref(false);
const contributingGoal = ref<Goal | null>(null);
const contributeForm = ref({ amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });
const contributeError = ref('');

const summaryDialog = ref(false);
const summaryGoal = ref<Goal | null>(null);

const summaryRows = computed(() => {
  const goal = summaryGoal.value;
  if (!goal || goal.contributions.length === 0) return [];

  const totalsByUser = new Map<string, { userName: string; total: number }>();

  for (const c of goal.contributions) {
    const existing = totalsByUser.get(c.userId) ?? { userName: c.userName, total: 0 };
    existing.total += Number(c.amount);
    existing.userName = c.userName;
    totalsByUser.set(c.userId, existing);
  }

  const grandTotal = Array.from(totalsByUser.values()).reduce((s, u) => s + u.total, 0);

  const members = store.couple?.members ?? [];

  return Array.from(totalsByUser.entries()).map(([userId, data]) => {
    const member = members.find((m) => m.userId === userId);
    return {
      userId,
      userName: data.userName || member?.name || 'Usuario',
      total: data.total,
      percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      role: member?.role ?? 'member',
    };
  });
});

function openSummary(goal: Goal) {
  summaryGoal.value = goal;
  summaryDialog.value = true;
}

const confirmDissolve = ref(false);
const confirmLeave = ref(false);
const confirmDeleteGoal = ref<Goal | null>(null);
const showDeleteGoal = computed({
  get: () => confirmDeleteGoal.value !== null,
  set: (v) => {
    if (!v) confirmDeleteGoal.value = null;
  },
});

const isOwner = computed(() => {
  return (
    store.couple?.members.some((m) => m.role === 'owner' && m.userId === auth.user?.id) ?? false
  );
});

function goalProgress(goal: Goal) {
  const target = Number(goal.targetAmount);
  if (target <= 0) return 0;
  return Math.min((Number(goal.currentAmount) / target) * 100, 100);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(async () => {
  await store.fetchCouple();
  if (store.couple) {
    await store.fetchGoals();
  }
});

async function handleCreate() {
  const result = createCoupleSchema.safeParse(createForm.value);
  if (!result.success) {
    store.error = result.error.issues[0].message;
    return;
  }
  try {
    await store.createCouple({ name: result.data.name.trim() });
    await store.fetchGoals();
  } catch {
    // error handled in store
  }
}

async function handleInvite() {
  const result = inviteSchema.safeParse({ email: inviteEmail.value });
  if (!result.success) {
    store.error = result.error.issues[0].message;
    return;
  }
  inviting.value = true;
  inviteSuccess.value = false;
  try {
    await store.invitePartner(result.data.email.trim());
    inviteEmail.value = '';
    inviteSuccess.value = true;
  } catch {
    // error handled in store
  } finally {
    inviting.value = false;
  }
}

function openEditName() {
  editNameForm.value = { name: store.couple?.name ?? '' };
  editNameError.value = '';
  editNameDialog.value = true;
}

async function handleEditName() {
  const result = updateCoupleSchema.safeParse(editNameForm.value);
  if (!result.success) {
    editNameError.value = result.error.issues[0].message;
    return;
  }
  try {
    await store.updateCouple({ name: result.data.name.trim() });
    editNameDialog.value = false;
  } catch {
    editNameError.value = store.error;
  }
}

async function handleLeave() {
  try {
    await store.leaveCouple();
    confirmLeave.value = false;
  } catch {
    // error handled in store
  }
}

async function handleDissolve() {
  try {
    await store.dissolveCouple();
    confirmDissolve.value = false;
  } catch {
    // error handled in store
  }
}

function openCreateGoal() {
  editingGoal.value = null;
  goalDeadline.value = null;
  goalForm.value = { title: '', targetAmount: '', deadline: '' };
  goalFormError.value = '';
  goalDialog.value = true;
}

function openEditGoal(goal: Goal) {
  editingGoal.value = goal;
  goalDeadline.value = goal.deadline ? new Date(goal.deadline) : null;
  goalForm.value = {
    title: goal.title,
    targetAmount: String(Number(goal.targetAmount)),
    deadline: goal.deadline?.slice(0, 10) ?? '',
  };
  goalFormError.value = '';
  goalDialog.value = true;
}

async function handleSaveGoal() {
  const schema = editingGoal.value ? updateGoalSchema : createGoalSchema;
  const result = schema.safeParse({
    title: goalForm.value.title,
    targetAmount: goalForm.value.targetAmount,
    deadline: goalDeadline.value ? goalDeadline.value.toISOString() : undefined,
  });
  if (!result.success) {
    goalFormError.value = result.error.issues[0].message;
    return;
  }
  try {
    const payload = result.data;

    await (editingGoal.value
      ? store.updateGoal(editingGoal.value.id, payload)
      : store.createGoal(payload as { title: string; targetAmount: string; deadline?: string }));
    goalDialog.value = false;
  } catch {
    goalFormError.value = store.error;
  }
}

async function handleDeleteGoal() {
  if (!confirmDeleteGoal.value) return;
  try {
    await store.deleteGoal(confirmDeleteGoal.value.id);
    confirmDeleteGoal.value = null;
  } catch {
    // error handled in store
  }
}

function openContribute(goal: Goal) {
  contributingGoal.value = goal;
  contributeDate.value = new Date();
  contributeForm.value = {
    amount: '',
    date: contributeDate.value.toISOString().slice(0, 10),
    notes: '',
  };
  contributeError.value = '';
  contributeDialog.value = true;
}

async function handleContribute() {
  const result = contributeSchema.safeParse({
    amount: contributeForm.value.amount,
    date: contributeDate.value.toISOString(),
    notes: contributeForm.value.notes?.trim() || undefined,
  });
  if (!result.success) {
    contributeError.value = result.error.issues[0].message;
    return;
  }
  try {
    const payload = result.data;

    if (contributingGoal.value) {
      await store.contributeToGoal(
        contributingGoal.value.id,
        payload as { amount: string; notes?: string; date?: string },
      );
      contributeDialog.value = false;
    }
  } catch {
    contributeError.value = store.error;
  }
}
</script>
