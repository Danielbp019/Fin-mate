<template>
  <v-dialog max-width="640" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h5 pa-4">{{ title }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-6 text-body-medium" style="line-height: 1.7">
        <slot />
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  defineProps<{
    modelValue: boolean
    title: string
  }>()

  defineEmits<{
    'update:modelValue': [value: boolean]
  }>()
</script>
