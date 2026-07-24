import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DatePicker from '@/components/DatePicker.vue';

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(DatePicker, {
    props,
    global: {
      stubs: {
        VDialog: {
          template: '<div><slot name="activator" :props="{}" /><slot /></div>',
          props: ['modelValue'],
        },
        VTextField: {
          props: ['modelValue', 'placeholder', 'density', 'required'],
          template:
            '<input :value="modelValue" :placeholder="placeholder" :data-density="density" :required="required" @click="$emit(\'click:clear\')" />',
          emits: ['click:clear'],
        },
        VDatePicker: {
          props: ['modelValue'],
          template: '<div class="v-date-picker-stub" />',
          emits: ['update:model-value'],
        },
      },
    },
  });
}

describe('DatePicker.vue', () => {
  it('renders input with placeholder', () => {
    const wrapper = createWrapper({ modelValue: null, placeholder: 'Selecciona fecha' });
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('placeholder')).toBe('Selecciona fecha');
  });

  it('displays formatted date when modelValue is provided', () => {
    const date = new Date(2024, 5, 15);
    const wrapper = createWrapper({ modelValue: date });
    const input = wrapper.find('input');
    const expected = date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    expect(input.attributes('value')).toBe(expected);
  });

  it('displays empty string when modelValue is null', () => {
    const wrapper = createWrapper({ modelValue: null });
    const input = wrapper.find('input');
    expect(input.attributes('value')).toBe('');
  });

  it('emits null when clear button is clicked', () => {
    const wrapper = createWrapper({ modelValue: new Date(2024, 5, 15) });
    const input = wrapper.find('input');
    input.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('passes density prop to input', () => {
    const wrapper = createWrapper({ modelValue: null, density: 'compact' });
    const input = wrapper.find('input');
    expect(input.attributes('data-density')).toBe('compact');
  });

  it('passes required prop to input', () => {
    const wrapper = createWrapper({ modelValue: null, required: true });
    const input = wrapper.find('input');
    expect(input.attributes('required')).toBe('');
  });

  it('emits update:modelValue when innerValue is set', () => {
    const wrapper = createWrapper({ modelValue: null }) as any;
    const date = new Date(2024, 6, 1);
    wrapper.vm.innerValue = date;
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([date]);
  });
});
