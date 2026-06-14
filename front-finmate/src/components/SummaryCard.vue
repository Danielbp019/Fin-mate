<template>
  <div class="summary-card">
    <div class="summary-card-header">
      <span class="summary-card-label">{{ label }}</span>

      <div class="summary-card-icon" :class="iconClass">
        <v-icon :color="iconColor" size="18">{{ icon }}</v-icon>
      </div>
    </div>

    <div class="summary-card-value">
      <CircularLoader v-if="loading" class="mr-2" :size="20" :width="2" />

      <template v-else>{{ formattedAmount }}</template>
    </div>

    <div v-if="change !== null" class="summary-card-change" :class="changeClass">
      <template v-if="change > 0">↑ {{ change }}% vs mes anterior</template>
      <template v-else-if="change < 0">↓ {{ Math.abs(change) }}% vs mes anterior</template>
      <template v-else>→ estable vs mes anterior</template>
    </div>

    <div v-else-if="!loading" class="summary-card-change change-neutral">
      sin datos del mes anterior
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import CircularLoader from '@/components/CircularLoader.vue';
import { formatCurrency } from '@/utils/format';

const props = defineProps<{
  label: string;
  amount: string;
  change: number | null;
  icon: string;
  iconClass: string;
  iconColor: string;
  loading?: boolean;
}>();

const formattedAmount = computed(() => formatCurrency(props.amount));

const changeClass = computed(() => {
  if (props.change === null) return 'change-neutral';
  if (props.change > 0) return 'change-positive';
  if (props.change < 0) return 'change-negative';
  return 'change-neutral';
});
</script>
