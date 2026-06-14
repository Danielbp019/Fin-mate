<template>
  <v-text-field
    :id="id"
    :aria-label="label"
    class="fm-input"
    :density="density"
    hide-details="auto"
    inputmode="decimal"
    :model-value="display"
    :placeholder="placeholder"
    :required="required"
    rounded="lg"
    type="text"
    variant="outlined"
    @blur="onBlur"
    @focus="onFocus"
    @update:model-value="onInput"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined;
    label?: string;
    id?: string;
    placeholder?: string;
    density?: 'default' | 'comfortable' | 'compact';
    required?: boolean;
  }>(),
  {
    placeholder: '0.00',
    density: 'comfortable',
    required: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isFocused = ref(false);
const display = ref('');

watch(
  () => props.modelValue,
  (val) => {
    if (!isFocused.value) {
      display.value = val ?? '';
    }
  },
  { immediate: true },
);

function sanitize(value: string): string {
  let raw = value.replace(/[^\d.]/g, '');
  const dotIndex = raw.indexOf('.');
  if (dotIndex !== -1) {
    const before = raw.slice(0, dotIndex + 1);
    const after = raw.slice(dotIndex + 1).replace(/\./g, '');
    raw = before + after;
  }
  return raw;
}

function onInput(value: string) {
  const raw = sanitize(value);
  emit('update:modelValue', raw);
  display.value = raw;
}

function onFocus() {
  isFocused.value = true;
  display.value = props.modelValue ?? '';
}

function onBlur() {
  isFocused.value = false;
  display.value = props.modelValue ?? '';
}
</script>
