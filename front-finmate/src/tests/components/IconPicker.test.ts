import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import IconPicker from '@/components/IconPicker.vue';

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(IconPicker, {
    props,
    global: {
      stubs: {
        VDialog: {
          props: ['modelValue'],
          template: '<div class="v-dialog-stub"><slot v-bind="$attrs" /></div>',
        },
        VIcon: { template: '<i class="v-icon-stub" />' },
        VBtn: {
          template: '<button class="v-btn-stub" @click="$emit(\'click\', $event)" />',
          emits: ['click'],
        },
        VTextField: {
          props: ['modelValue'],
          template:
            '<input class="v-text-field-stub" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />',
          emits: ['update:model-value'],
        },
        VCard: { template: '<div class="v-card-stub"><slot /></div>' },
        VCardTitle: { template: '<div class="v-card-title-stub"><slot /></div>' },
        VCardText: { template: '<div class="v-card-text-stub"><slot /></div>' },
        VCardActions: { template: '<div class="v-card-actions-stub"><slot /></div>' },
        VSpacer: { template: '<div />' },
      },
    },
  });
}

describe('IconPicker.vue', () => {
  it('shows "Ninguno" when no icon selected', () => {
    const wrapper = createWrapper({ modelValue: '' });
    expect(wrapper.text()).toContain('Ninguno');
  });

  it('shows dialog when trigger is clicked', async () => {
    const wrapper = createWrapper({ modelValue: '' });
    await wrapper.find('.fm-select-trigger').trigger('click');
    expect(wrapper.find('.v-dialog-stub').exists()).toBe(true);
  });

  it('emits update:modelValue when icon is selected', async () => {
    const wrapper = createWrapper({ modelValue: '' });
    await wrapper.find('.fm-select-trigger').trigger('click');
    await wrapper.find('.fm-picker-cell').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('emits empty string when clear icon is clicked', async () => {
    const wrapper = createWrapper({ modelValue: 'mdi-cash' });
    await wrapper.find('.fm-select-trigger').trigger('click');
    const buttons = wrapper.findAll('.v-btn-stub');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['']);
  });

  it('shows all icons when search is empty', async () => {
    const wrapper = createWrapper({ modelValue: '' });
    await wrapper.find('.fm-select-trigger').trigger('click');
    const cells = wrapper.findAll('.fm-picker-cell');
    expect(cells.length).toBe(60);
  });

  it('filters icons based on search', async () => {
    const wrapper = createWrapper({ modelValue: '' });
    await wrapper.find('.fm-select-trigger').trigger('click');
    const input = wrapper.find('input.v-text-field-stub');
    await input.setValue('food');
    const cells = wrapper.findAll('.fm-picker-cell');
    expect(cells.length).toBeGreaterThan(0);
  });
});
