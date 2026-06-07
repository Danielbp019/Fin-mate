<template>
  <div class="chart-wrapper">
    <h3 class="chart-title">{{ title }}</h3>

    <div v-if="loading" class="chart-loading">
      <v-progress-circular color="primary" indeterminate size="32" />
    </div>

    <div v-else-if="noData" class="chart-empty">
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="chart-area">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TooltipItem } from 'chart.js';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  title: string;
  labels: string[];
  data: number[];
  backgroundColors: string[];
  loading?: boolean;
  noData?: boolean;
  emptyText?: string;
}>();

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.backgroundColors,
      borderRadius: 4,
      borderSkipped: false,
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
        label: (ctx: TooltipItem<'bar'>) => {
          const val = ctx.parsed.y ?? 0;
          return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
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
