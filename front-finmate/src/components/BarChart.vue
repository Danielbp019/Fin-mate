<template>
  <div class="chart-wrapper">
    <component :is="headingLevel" class="chart-title">{{ title }}</component>

    <div v-if="loading" class="chart-loading">
      <CircularLoader :size="32" />
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
import CircularLoader from '@/components/CircularLoader.vue';
import { formatCurrency } from '@/utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = withDefaults(
  defineProps<{
    title: string;
    labels: string[];
    data: number[];
    backgroundColors: string[];
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
          return formatCurrency(String(val));
        },
      },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: {
        callback: (value: string | number) => formatCurrency(String(value)),
      },
    },
  },
};
</script>
