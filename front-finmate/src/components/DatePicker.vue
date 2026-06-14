<template>
  <v-menu v-model="menu" :close-on-content-click="false">
    <template #activator="{ props: fieldProps }">
      <v-text-field
        :id="props.id"
        :aria-label="props.label"
        v-bind="fieldProps"
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

    <v-locale-provider locale="es">
      <v-date-picker v-model="innerValue" @update:model-value="menu = false" />
    </v-locale-provider>
  </v-menu>
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
  return props.modelValue.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});
</script>
