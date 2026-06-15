<template>
  <v-progress-linear
    v-if="loading"
    color="var(--green-deep)"
    height="5"
    indeterminate
  />
</template>

<script setup lang="ts">
/** LinearLoader — loader lineal indeterminado (v-progress-linear). Usado en: Categories, Movements, Debts (tablas) */
defineProps<{ loading: boolean }>();
</script>
