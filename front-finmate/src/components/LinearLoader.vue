<template>
  <v-progress-linear
    v-if="loading"
    color="var(--green-deep)"
    height="5"
    indeterminate
  />
</template>

<script setup lang="ts">
defineProps<{ loading: boolean }>();
</script>
