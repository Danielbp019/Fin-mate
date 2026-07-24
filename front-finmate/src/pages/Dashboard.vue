<template>
  <div class="dashboard-container">
    <div class="dashboard-greeting">
      <h1>Bienvenido, {{ auth.user?.name }}</h1>
      <p>Resumen de {{ currentMonthLabel }}</p>
    </div>

    <v-row>
      <v-col cols="12" md="4">
        <SummaryCard
          :amount="summary?.currentMonth.totalIncome ?? '0'"
          :change="summary?.comparison.incomeChange ?? null"
          icon="mdi-trending-up"
          icon-class="sc-icon-green"
          icon-color="var(--green-deep)"
          label="Ingresos"
          :loading="loading"
        />
      </v-col>

      <v-col cols="12" md="4">
        <SummaryCard
          :amount="summary?.currentMonth.totalExpense ?? '0'"
          :change="summary?.comparison.expenseChange ?? null"
          icon="mdi-trending-down"
          icon-class="sc-icon-gold"
          icon-color="var(--gold)"
          label="Gastos"
          :loading="loading"
        />
      </v-col>

      <v-col cols="12" md="4">
        <SummaryCard
          :amount="summary?.currentMonth.balance ?? '0'"
          :change="balanceChange"
          icon="mdi-wallet"
          icon-class="sc-icon-blue"
          icon-color="var(--blue-deep)"
          label="Balance"
          :loading="loading"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <div class="summary-card chart-card">
          <LineChart
            :datasets="evolutionDatasets"
            empty-text="No hay suficientes datos para mostrar la evolución mensual"
            :labels="evolutionLabels"
            :loading="loading"
            :no-data="!loading && (!summary?.monthlyBalance || summary.monthlyBalance.length === 0)"
            title="Evolución mensual"
          />
        </div>
      </v-col>

      <v-col cols="12" lg="4">
        <div class="summary-card chart-card">
          <BarChart
            :background-colors="balanceColors"
            :data="balanceData"
            empty-text="No hay datos suficientes"
            :labels="balanceLabels"
            :loading="loading"
            :no-data="!loading && (!summary?.monthlyBalance || summary.monthlyBalance.length === 0)"
            title="Balance por mes"
          />
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <div class="summary-card chart-card">
          <DoughnutChart
            :colors="categoryColors"
            :data="incomeCategoryData"
            empty-text="Sin ingresos este mes"
            :labels="incomeCategoryLabels"
            :loading="loading"
            :no-data="
              !loading && (!summary?.incomeByCategory || summary.incomeByCategory.length === 0)
            "
            title="Ingresos por categoría"
          />
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="summary-card chart-card">
          <DoughnutChart
            :colors="categoryColors"
            :data="expenseCategoryData"
            empty-text="Sin gastos este mes"
            :labels="expenseCategoryLabels"
            :loading="loading"
            :no-data="
              !loading && (!summary?.expenseByCategory || summary.expenseByCategory.length === 0)
            "
            title="Gastos por categoría"
          />
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <div class="summary-card">
          <h2 class="content-card-title">Últimos movimientos</h2>

          <div v-if="loading" class="chart-loading">
            <CircularLoader :size="32" />
          </div>

          <div
            v-else-if="!summary?.recentMovements || summary.recentMovements.length === 0"
            class="chart-empty"
          >
            <p>Aún no hay movimientos registrados.</p>
          </div>

          <div v-else>
            <div v-for="m in summary!.recentMovements" :key="m.id" class="movement-item">
              <div
                class="movement-icon"
                :class="m.type === 'income' ? 'sc-icon-green' : 'sc-icon-gold'"
              >
                <v-icon
                  :color="m.type === 'income' ? 'var(--green-deep)' : 'var(--gold)'"
                  size="18"
                >
                  {{ m.type === 'income' ? 'mdi-plus' : 'mdi-minus' }}
                </v-icon>
              </div>

              <div class="movement-info">
                <div class="movement-category">
                  <v-icon v-if="m.categoryIcon" class="mr-1" size="16">{{ m.categoryIcon }}</v-icon>
                  {{ m.categoryName }} · {{ formatDate(m.movementDate) }}
                </div>

                <div class="movement-desc">{{ m.description || 'Sin descripción' }}</div>
              </div>

              <div class="movement-amount" :class="m.type">
                {{ formatCurrency(m.amount) }}
              </div>
            </div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="summary-card">
          <h2 class="content-card-title">Deudas activas</h2>

          <div v-if="loading" class="chart-loading">
            <CircularLoader :size="32" />
          </div>

          <div v-else-if="!summary?.activeDebts" class="chart-empty">
            <p>No tienes deudas registradas.</p>
          </div>

          <div v-else>
            <div class="stat-row">
              <span class="stat-row-label">Deudas activas</span>
              <span class="stat-row-value">{{ summary!.activeDebts!.count }}</span>
            </div>

            <div class="stat-row">
              <span class="stat-row-label">Total pendiente</span>

              <span class="stat-row-value">{{
                formatCurrency(summary!.activeDebts!.totalRemaining)
              }}</span>
            </div>
          </div>
        </div>

        <div class="summary-card" style="margin-top: 16px">
          <h2 class="content-card-title">Metas de pareja</h2>

          <div v-if="loading" class="chart-loading">
            <CircularLoader :size="32" />
          </div>

          <div v-else-if="summary?.coupleGoals">
            <div class="stat-row">
              <span class="stat-row-label">Metas activas</span>
              <span class="stat-row-value">{{ summary.coupleGoals.active }}</span>
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <span class="left">Progreso general</span>
                <span class="right">{{ summary.coupleGoals.totalProgress }}%</span>
              </div>

              <v-progress-linear
                color="green"
                height="8"
                :model-value="summary.coupleGoals.totalProgress"
                rounded
              />
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
/** Dashboard — panel principal con resumen mensual, gráficos (líneas, barras, donas), últimos movimientos, deudas activas y metas de pareja. Usado en ruta '/dashboard' */
import { computed, onMounted } from 'vue';
import CircularLoader from '@/components/CircularLoader.vue';
import BarChart from '@/components/Dashboard/BarChart.vue';
import DoughnutChart from '@/components/Dashboard/DoughnutChart.vue';
import LineChart from '@/components/Dashboard/LineChart.vue';
import SummaryCard from '@/components/Dashboard/SummaryCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { formatCurrency } from '@/utils/format';
import '@/styles/auth.css';

const auth = useAuthStore();
const dashboard = useDashboardStore();

const summary = computed(() => dashboard.summary);
const loading = computed(() => dashboard.loading);

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const currentMonthLabel = computed(() => {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const palette = [
  '#0F6E56',
  '#378ADD',
  '#BA7517',
  '#D32F2F',
  '#7B1FA2',
  '#E64A19',
  '#00897B',
  '#F9A825',
  '#5C6BC0',
  '#C2185B',
  '#6D4C41',
  '#78909C',
];

const categoryColors = computed(() => {
  const len = summary.value?.incomeByCategory?.length ?? 0;
  return palette.slice(0, Math.max(len, palette.length));
});

const evolutionLabels = computed(
  () =>
    summary.value?.monthlyBalance?.map((m) => {
      const [y, mo] = m.month.split('-');
      return `${MONTHS[Number(mo) - 1]} ${y}`;
    }) ?? [],
);

const evolutionDatasets = computed(() => {
  if (!summary.value?.monthlyBalance) return [];
  return [
    {
      label: 'Ingresos',
      data: summary.value.monthlyBalance.map((m) => Number.parseFloat(m.income)),
      borderColor: '#1D9E75',
      backgroundColor: 'rgba(29, 158, 117, 0.08)',
      fill: true,
    },
    {
      label: 'Gastos',
      data: summary.value.monthlyBalance.map((m) => Number.parseFloat(m.expense)),
      borderColor: '#BA7517',
      backgroundColor: 'rgba(186, 117, 23, 0.08)',
      fill: true,
    },
  ];
});

const incomeCategoryLabels = computed(
  () => summary.value?.incomeByCategory?.map((c) => c.categoryName) ?? [],
);

const incomeCategoryData = computed(
  () => summary.value?.incomeByCategory?.map((c) => Number.parseFloat(c.total)) ?? [],
);

const expenseCategoryLabels = computed(
  () => summary.value?.expenseByCategory?.map((c) => c.categoryName) ?? [],
);

const expenseCategoryData = computed(
  () => summary.value?.expenseByCategory?.map((c) => Number.parseFloat(c.total)) ?? [],
);

const balanceLabels = computed(() => {
  const list = summary.value?.monthlyBalance ?? [];
  return list.map((m) => {
    const [, mo] = m.month.split('-');
    return `${MONTHS[Number(mo) - 1]}`;
  });
});

const balanceData = computed(
  () => summary.value?.monthlyBalance?.map((m) => Number.parseFloat(m.balance)) ?? [],
);

const balanceColors = computed(() =>
  balanceData.value.map((v) => (v >= 0 ? 'rgba(29, 158, 117, 0.7)' : 'rgba(211, 47, 47, 0.7)')),
);

const balanceChange = computed(() => {
  const list = summary.value?.monthlyBalance;
  if (!list || list.length < 2) return null;
  const current = Number.parseFloat(list.at(-1)!.balance);
  const previous = Number.parseFloat(list.at(-2)!.balance);
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
});

onMounted(() => {
  dashboard.fetchSummary();
});
</script>
