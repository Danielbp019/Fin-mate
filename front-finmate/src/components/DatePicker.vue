<template>
  <v-dialog
    max-width="340"
    :model-value="menu"
    @update:model-value="menu = $event"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        :id="props.id"
        :aria-label="props.label"
        v-bind="activatorProps"
        class="fm-input"
        clearable
        :density="density"
        hide-details="auto"
        :model-value="displayValue"
        :placeholder="placeholder"
        readonly
        :required="required"
        rounded="lg"
        variant="outlined"
        @click:clear="emit('update:modelValue', null)"
      />
    </template>

    <v-card rounded="xl">
      <v-card-title class="text-h5 font-weight-bold pa-4 d-flex align-center">
        Seleccionar fecha
        <v-spacer />

        <v-btn icon variant="text" @click="menu = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-date-picker v-model="innerValue" @update:model-value="menu = false" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: Date | null;
    label?: string;
    id?: string;
    placeholder?: string;
    density?: 'default' | 'comfortable' | 'compact';
    required?: boolean;
  }>(),
  {
    placeholder: '',
    density: 'comfortable',
    required: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Date | null];
}>();

const menu = ref(false);

const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  return props.modelValue.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});
</script>
