<template>
  <div class="chart-wrapper">
    <h3 class="chart-title">{{ title }}</h3>

    <div v-if="loading" class="chart-loading">
      <v-progress-circular color="primary" indeterminate size="32" />
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
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  title: string;
  labels: string[];
  data: number[];
  colors: string[];
  loading?: boolean;
  noData?: boolean;
  emptyText?: string;
}>();

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
          `${ctx.label}: $${ctx.parsed.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  cutout: '60%',
};

const legendItems = computed(() =>
  props.labels.map((label, i) => ({
    label,
    color: props.colors[i] || '#ccc',
    value: `$${props.data[i]?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0'}`,
  })),
);
</script>
