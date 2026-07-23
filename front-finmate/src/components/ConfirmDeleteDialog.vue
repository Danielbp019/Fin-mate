<template>
  <v-dialog
    max-width="540"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        {{ title }}
        <v-spacer />

        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <slot name="message">
          <p v-if="itemName">
            ¿Estás seguro de {{ actionText }} <strong>{{ itemName }}</strong>?
          </p>

          <p v-else>
            ¿Estás seguro de realizar esta acción?
          </p>
        </slot>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn rounded="lg" variant="text" @click="$emit('update:modelValue', false)">
          Cancelar
        </v-btn>

        <v-btn
          :color="confirmColor"
          :loading="loading"
          rounded="lg"
          variant="tonal"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  itemName?: string;
  actionText?: string;
  confirmText?: string;
  confirmColor?: string;
  loading?: boolean;
}>(), {
  actionText: 'eliminar',
  confirmText: 'Eliminar',
  confirmColor: 'error',
  loading: false,
});

defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();
</script>
