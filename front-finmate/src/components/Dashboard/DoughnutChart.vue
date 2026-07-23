<template>
  <div class="chart-wrapper">
    <component :is="headingLevel" class="chart-title">{{ title }}</component>

    <div v-if="loading" class="chart-loading">
      <CircularLoader :size="32" />
    </div>

    <div v-else-if="noData" class="chart-empty">
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="doughnut-layout">
      <div class="doughnut-canvas">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>

      <div class="doughnut-legend">
        <div v-for="(item, i) in legendItems" :key="i" class="legend-item">
          <span class="legend-dot" :style="{ background: item.color }" />
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/** DoughnutChart — gráfico de dona (Chart.js Doughnut) para distribución de ingresos/gastos por categoría. Usado en: Dashboard */
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import CircularLoader from '@/components/CircularLoader.vue';
import { formatCurrency } from '@/utils/format';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = withDefaults(
  defineProps<{
    title: string;
    labels: string[];
    data: number[];
    colors: string[];
    loading?: boolean;
    noData?: boolean;
    emptyText?: string;
    headingLevel?: string;
  }>(),
  {
    headingLevel: 'h2',
  },
);

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors,
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: number; label: string }) =>
          `${ctx.label}: ${formatCurrency(String(ctx.parsed))}`,
      },
    },
  },
  cutout: '60%',
};

const legendItems = computed(() =>
  props.labels.map((label, i) => ({
    label,
    color: props.colors[i] || '#ccc',
    value: formatCurrency(String(props.data[i] ?? 0)),
  })),
);
</script>
