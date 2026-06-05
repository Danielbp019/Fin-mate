<template>
  <div class="dashboard-container">
    <template v-if="store.loading && !store.couple">
      <v-progress-circular color="#0F6E56" indeterminate size="40" width="3" />
    </template>

    <template v-else-if="!store.couple">
      <div class="dashboard-greeting">
        <h1>Pareja</h1>
        <p>Administra tus finanzas en pareja con metas compartidas</p>
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

      <div class="page-grid">
        <v-card>
          <v-card-text class="pa-4">
            <h2 class="text-h6 font-weight-bold mb-1">Crear grupo</h2>
            <p class="text-caption mb-4">
              Crea un grupo de finanzas compartidas e invita a tu pareja
            </p>

            <v-form @submit.prevent="handleCreate">
              <div class="fm-field-group">
                <label class="fm-label">Nombre del grupo</label>
                <v-text-field
                  v-model="createForm.name"
                  class="fm-input"
                  density="comfortable"
                  hide-details="auto"
                  placeholder="Ej: Nuestras finanzas"
                  required
                  rounded="lg"
                  variant="outlined"
                />
              </div>

              <v-btn
                block
                class="fm-btn-submit mt-2"
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
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-text class="pa-4">
            <h2 class="text-h6 font-weight-bold mb-1">¿Te invitaron?</h2>
            <p class="text-caption mb-2">
              Si tu pareja ya creó un grupo y te envió una invitación por correo, recibirás un
              enlace para unirte automáticamente.
            </p>
            <p class="text-caption">
              Si tienes un enlace de invitación, ábrelo desde este navegador para unirte.
            </p>
          </v-card-text>
        </v-card>
      </div>
    </template>

    <template v-else>
      <div
        class="dashboard-greeting"
        style="display: flex; align-items: center; justify-content: space-between"
      >
        <div>
          <div style="display: flex; align-items: center; gap: 12px">
            <h1>{{ store.couple.name }}</h1>
            <v-btn icon size="small" title="Editar nombre" variant="text" @click="openEditName">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </div>
          <p>Grupo de finanzas compartidas</p>
        </div>
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

      <div class="summary-grid">
        <v-card v-for="member in store.couple.members" :key="member.id" class="summary-card">
          <div class="summary-card-header">
            <span class="summary-card-label">{{
              member.role === 'owner' ? 'Propietario' : 'Miembro'
            }}</span>
            <div
              class="summary-card-icon sc-icon-green"
              style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 16px;
                font-weight: 600;
                color: #0f6e56;
              "
            >
              {{ member.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="summary-card-value" style="font-size: 18px">
            {{ member.name }}
          </div>
          <div class="summary-card-change" style="font-size: 13px; color: rgba(0, 0, 0, 0.5)">
            {{ member.email }}
          </div>
        </v-card>

        <v-card
          v-if="store.couple.members.length < 2"
          class="summary-card"
          style="display: flex; flex-direction: column; justify-content: center"
        >
          <v-card-text class="pa-4">
            <h3 class="text-subtitle-2 font-weight-bold mb-2">Invitar a mi pareja</h3>
            <v-form @submit.prevent="handleInvite">
              <div style="display: flex; gap: 8px">
                <v-text-field
                  v-model="inviteEmail"
                  class="fm-input"
                  density="compact"
                  hide-details="auto"
                  placeholder="Correo electrónico"
                  rounded="lg"
                  type="email"
                  variant="outlined"
                />
                <v-btn
                  class="fm-btn-submit"
                  :disabled="!inviteEmail.trim()"
                  :loading="inviting"
                  rounded="lg"
                  size="small"
                  type="submit"
                >
                  Invitar
                  <template #loader>
                    <v-progress-circular color="white" indeterminate size="16" width="2" />
                  </template>
                </v-btn>
              </div>
            </v-form>
            <p v-if="inviteSuccess" class="mt-2 text-caption" style="color: #0f6e56">
              Invitación enviada correctamente
            </p>
          </v-card-text>
        </v-card>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 24px">
        <v-btn
          v-if="isOwner"
          color="error"
          :loading="store.saving"
          rounded="lg"
          variant="tonal"
          @click="confirmDissolve = true"
        >
          <v-icon>mdi-heart-broken</v-icon> Disolver grupo
        </v-btn>
        <v-btn
          v-else
          color="error"
          :loading="store.saving"
          rounded="lg"
          variant="tonal"
          @click="confirmLeave = true"
        >
          <v-icon>mdi-exit-to-app</v-icon> Abandonar grupo
        </v-btn>
      </div>

      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        "
      >
        <div>
          <h2 class="text-h5 font-weight-bold">Metas compartidas</h2>
          <p class="text-caption">Ahorren juntos para lo que más importa</p>
        </div>
        <v-btn
          class="fm-btn-submit"
          color="#0F6E56"
          prepend-icon="mdi-plus"
          @click="openCreateGoal"
        >
          Nueva meta
        </v-btn>
      </div>

      <div
        v-if="store.goals.length === 0"
        class="text-center pa-8"
        style="color: rgba(0, 0, 0, 0.4)"
      >
        <v-icon size="48" style="opacity: 0.4">mdi-flag-outline</v-icon>
        <p class="mt-2">Aún no hay metas. ¡Crea la primera!</p>
      </div>

      <div class="summary-grid">
        <v-card v-for="goal in store.goals" :key="goal.id" class="summary-card">
          <v-card-text class="pa-4">
            <div style="display: flex; justify-content: space-between; align-items: start">
              <div>
                <h3 class="font-weight-bold" style="font-size: 16px">{{ goal.title }}</h3>
                <v-chip
                  v-if="goal.status !== 'active'"
                  class="mt-1"
                  :color="goal.status === 'completed' ? 'green' : 'grey'"
                  size="x-small"
                  variant="tonal"
                >
                  {{ goal.status === 'completed' ? 'Completada' : 'Cancelada' }}
                </v-chip>
              </div>
              <div v-if="goal.status === 'active'" style="display: flex; gap: 4px">
                <v-btn
                  icon
                  size="x-small"
                  title="Contribuir"
                  variant="text"
                  @click="openContribute(goal)"
                >
                  <v-icon>mdi-hand-coin</v-icon>
                </v-btn>
                <v-btn
                  v-if="isOwner"
                  icon
                  size="x-small"
                  title="Editar"
                  variant="text"
                  @click="openEditGoal(goal)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  v-if="isOwner"
                  icon
                  size="x-small"
                  title="Eliminar"
                  variant="text"
                  @click="confirmDeleteGoal = goal"
                >
                  <v-icon color="error">mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="mt-3">
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 13px;
                  margin-bottom: 4px;
                "
              >
                <span style="font-weight: 500">
                  ${{
                    Number(goal.currentAmount).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                  }}
                </span>
                <span style="color: rgba(0, 0, 0, 0.5)">
                  ${{
                    Number(goal.targetAmount).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                  }}
                </span>
              </div>
              <v-progress-linear
                :color="goal.status === 'completed' ? 'green' : '#0F6E56'"
                height="8"
                :model-value="goalProgress(goal)"
                rounded
              />
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;
                "
              >
                <span style="color: rgba(0, 0, 0, 0.5)">{{ Math.round(goalProgress(goal)) }}%</span>
                <span v-if="goal.deadline" style="color: rgba(0, 0, 0, 0.5)">
                  Meta: {{ formatDate(goal.deadline) }}
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>

    <v-dialog v-model="editNameDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">Editar nombre del grupo</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-alert
            v-if="editNameError"
            class="mb-4"
            closable
            density="compact"
            rounded="lg"
            type="error"
            variant="tonal"
            @click:close="editNameError = ''"
          >
            {{ editNameError }}
          </v-alert>

          <v-form @submit.prevent="handleEditName">
            <div class="fm-field-group">
              <label class="fm-label">Nombre</label>
              <v-text-field
                v-model="editNameForm.name"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                required
                rounded="lg"
                variant="outlined"
              />
            </div>

            <v-btn
              block
              class="fm-btn-submit mt-2"
              :loading="store.saving"
              rounded="lg"
              size="large"
              type="submit"
            >
              Guardar
              <template #loader>
                <v-progress-circular color="white" indeterminate size="20" width="2" />
              </template>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="goalDialog" max-width="520">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">
          {{ editingGoal ? 'Editar meta' : 'Nueva meta' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-alert
            v-if="goalFormError"
            class="mb-4"
            closable
            density="compact"
            rounded="lg"
            type="error"
            variant="tonal"
            @click:close="goalFormError = ''"
          >
            {{ goalFormError }}
          </v-alert>

          <v-form @submit.prevent="handleSaveGoal">
            <div class="fm-field-group">
              <label class="fm-label">Título</label>
              <v-text-field
                v-model="goalForm.title"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                placeholder="Ej: Viaje a la playa"
                required
                rounded="lg"
                variant="outlined"
              />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Monto objetivo</label>
              <v-text-field
                v-model="goalForm.targetAmount"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                min="0"
                placeholder="0.00"
                required
                rounded="lg"
                step="0.01"
                type="number"
                variant="outlined"
              />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Fecha límite (opcional)</label>
              <DatePicker v-model="goalDeadline" />
            </div>

            <v-btn
              block
              class="fm-btn-submit mt-2"
              :loading="store.saving"
              rounded="lg"
              size="large"
              type="submit"
            >
              {{ editingGoal ? 'Guardar cambios' : 'Crear meta' }}
              <template #loader>
                <v-progress-circular color="white" indeterminate size="20" width="2" />
              </template>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="contributeDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">
          Contribuir · {{ contributingGoal?.title }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-alert
            v-if="contributeError"
            class="mb-4"
            closable
            density="compact"
            rounded="lg"
            type="error"
            variant="tonal"
            @click:close="contributeError = ''"
          >
            {{ contributeError }}
          </v-alert>

          <div class="mb-4 pa-3" style="background: rgba(15, 110, 86, 0.05); border-radius: 12px">
            <div style="display: flex; justify-content: space-between; font-size: 13px">
              <span>Progreso actual</span>
              <span style="font-weight: 500">
                ${{
                  Number(contributingGoal?.currentAmount ?? 0).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })
                }}
                de ${{
                  Number(contributingGoal?.targetAmount ?? 0).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })
                }}
              </span>
            </div>
          </div>

          <v-form @submit.prevent="handleContribute">
            <div class="fm-field-group">
              <label class="fm-label">Monto a contribuir</label>
              <v-text-field
                v-model="contributeForm.amount"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                min="0"
                placeholder="0.00"
                required
                rounded="lg"
                step="0.01"
                type="number"
                variant="outlined"
              />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Fecha</label>
              <DatePicker v-model="contributeDate" required />
            </div>

            <div class="fm-field-group">
              <label class="fm-label">Notas (opcional)</label>
              <v-textarea
                v-model="contributeForm.notes"
                class="fm-input"
                density="comfortable"
                hide-details="auto"
                maxlength="255"
                placeholder="Nota sobre el aporte"
                rounded="lg"
                rows="2"
                variant="outlined"
              />
            </div>

            <v-btn
              block
              class="fm-btn-submit mt-2"
              :loading="store.saving"
              rounded="lg"
              size="large"
              type="submit"
            >
              Contribuir
              <template #loader>
                <v-progress-circular color="white" indeterminate size="20" width="2" />
              </template>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDissolve" max-width="400">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">Disolver grupo</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <p>
            ¿Estás seguro de disolver el grupo <strong>{{ store.couple?.name }}</strong
            >?
          </p>
          <p class="mt-2 text-caption">
            Las metas activas se cancelarán y los registros financieros se desvincularán. Esta
            acción no se puede deshacer.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="confirmDissolve = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="store.saving"
            rounded="lg"
            variant="tonal"
            @click="handleDissolve"
          >
            Disolver
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmLeave" max-width="400">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">Abandonar grupo</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <p>
            ¿Estás seguro de abandonar el grupo <strong>{{ store.couple?.name }}</strong
            >?
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="confirmLeave = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="store.saving"
            rounded="lg"
            variant="tonal"
            @click="handleLeave"
          >
            Abandonar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteGoal" max-width="400" :value="!!confirmDeleteGoal">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">Eliminar meta</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <p>
            ¿Estás seguro de eliminar la meta <strong>{{ confirmDeleteGoal?.title }}</strong
            >?
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="confirmDeleteGoal = null">Cancelar</v-btn>
          <v-btn color="error" rounded="lg" variant="tonal" @click="handleDeleteGoal">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import type { Goal } from '@/types';
import { computed, onMounted, ref, watch } from 'vue';
import DatePicker from '@/components/DatePicker.vue';
import { useAuthStore } from '@/stores/auth';
import { useCouplesStore } from '@/stores/couples';
import '@/styles/theme.css';

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

const confirmDissolve = ref(false);
const confirmLeave = ref(false);
const confirmDeleteGoal = ref<Goal | null>(null);

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
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(async () => {
  await store.fetchCouple();
  if (store.couple) {
    await store.fetchGoals();
  }
});

async function handleCreate() {
  if (!createForm.value.name.trim()) {
    store.error = 'El nombre del grupo es obligatorio';
    return;
  }
  try {
    await store.createCouple({ name: createForm.value.name.trim() });
    await store.fetchGoals();
  } catch {
    // error handled in store
  }
}

async function handleInvite() {
  if (!inviteEmail.value.trim()) return;
  inviting.value = true;
  inviteSuccess.value = false;
  try {
    await store.invitePartner(inviteEmail.value.trim());
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
  if (!editNameForm.value.name.trim()) {
    editNameError.value = 'El nombre es obligatorio';
    return;
  }
  try {
    await store.updateCouple({ name: editNameForm.value.name.trim() });
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
    targetAmount: goal.targetAmount,
    deadline: goal.deadline?.slice(0, 10) ?? '',
  };
  goalFormError.value = '';
  goalDialog.value = true;
}

async function handleSaveGoal() {
  if (!goalForm.value.title.trim()) {
    goalFormError.value = 'El título es obligatorio';
    return;
  }
  if (!goalForm.value.targetAmount || Number(goalForm.value.targetAmount) <= 0) {
    goalFormError.value = 'Ingresa un monto objetivo válido';
    return;
  }

  try {
    const payload: Record<string, unknown> = {
      title: goalForm.value.title.trim(),
      targetAmount: goalForm.value.targetAmount,
    };
    if (goalDeadline.value) {
      payload.deadline = goalDeadline.value.toISOString();
    }

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
  if (!contributeForm.value.amount || Number(contributeForm.value.amount) <= 0) {
    contributeError.value = 'Ingresa un monto válido';
    return;
  }
  if (!contributeForm.value.date) {
    contributeError.value = 'Selecciona una fecha';
    return;
  }

  try {
    const payload: Record<string, unknown> = {
      amount: contributeForm.value.amount,
      date: contributeDate.value.toISOString(),
    };
    if (contributeForm.value.notes) payload.notes = contributeForm.value.notes.trim();

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
