<template>
  <v-text-field
    :id="id"
    v-model="display"
    :aria-label="label"
    class="fm-input"
    :density="density"
    hide-details="auto"
    inputmode="numeric"
    :placeholder="placeholder"
    :required="required"
    rounded="lg"
    type="text"
    variant="outlined"
    @blur="isFocused = false"
    @focus="isFocused = true"
  />
</template>

<script setup lang="ts">
/** AmountInput — campo de texto con formato moneda COP y separadores de miles. Usado en: Movements, Debts, Couples */
import { computed, ref } from 'vue';
import { formatNumber, stripFormatting } from '@/utils/format';

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined;
    locale?: string;
    id?: string;
    label?: string;
    placeholder?: string;
    density?: 'default' | 'comfortable' | 'compact';
    required?: boolean;
  }>(),
  {
    locale: 'es-CO',
    placeholder: '0',
    density: 'comfortable',
    required: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isFocused = ref(false);

const display = computed({
  get: () => {
    if (!props.modelValue) return '';
    if (isFocused.value) return props.modelValue;
    return formatNumber(props.modelValue, props.locale);
  },
  set: (val) => {
    const raw = stripFormatting(val);
    emit('update:modelValue', raw);
  },
});
</script>
