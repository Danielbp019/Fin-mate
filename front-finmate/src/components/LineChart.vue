<template>
  <div class="chart-wrapper">
    <h3 class="chart-title">{{ title }}</h3>
    <div v-if="loading" class="chart-loading">
      <v-progress-circular color="primary" indeterminate size="32" />
    </div>
    <div v-else-if="noData" class="chart-empty">
      <p>{{ emptyText }}</p>
    </div>
    <Line v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts" setup>
import type { TooltipItem } from 'chart.js';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { computed } from 'vue';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps<{
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }[];
  loading?: boolean;
  noData?: boolean;
  emptyText?: string;
}>();

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    ...ds,
    tension: 0.3,
    fill: ds.fill ?? false,
    pointRadius: 3,
    pointHoverRadius: 5,
  })),
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { usePointStyle: true, padding: 16 },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'>) => {
          const val = ctx.parsed.y ?? 0;
          return `${ctx.dataset.label}: $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
        },
      },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: {
        callback: (value: string | number) => `$${Number(value).toLocaleString('es-MX')}`,
      },
    },
  },
};
</script>
