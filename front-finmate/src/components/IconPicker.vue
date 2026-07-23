<template>
  <div>
    <div
      :id="id"
      :class="['fm-select-trigger', { focused: dialogOpen }]"
      role="button"
      tabindex="0"
      @click="dialogOpen = true"
      @keydown.enter.prevent="dialogOpen = true"
      @keydown.space.prevent="dialogOpen = true"
    >
      <div class="d-flex align-center ga-2">
        <v-icon v-if="modelValue" size="24">{{ modelValue }}</v-icon>
        <span v-else class="text-body-2 text-disabled">Ninguno</span>
      </div>

      <v-icon class="fm-trigger-arrow" size="20">mdi-chevron-down</v-icon>
    </div>

    <v-dialog v-model="dialogOpen" max-width="540">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-4 pb-2 d-flex align-center">
          Seleccionar icono
          <v-spacer />

          <v-btn icon variant="text" @click="dialogOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pt-2">
          <v-text-field
            v-model="search"
            aria-label="Buscar icono"
            class="fm-input mb-3"
            clearable
            density="compact"
            hide-details
            placeholder="Buscar icono..."
            prepend-inner-icon="mdi-magnify"
            rounded="lg"
            variant="outlined"
          />

          <div class="fm-picker-grid">
            <div
              v-for="icon in filteredIcons"
              :key="icon"
              :class="['fm-picker-cell', { selected: modelValue === icon }]"
              role="button"
              tabindex="0"
              @click="selectIcon(icon)"
              @keydown.enter.prevent="selectIcon(icon)"
              @keydown.space.prevent="selectIcon(icon)"
            >
              <v-icon size="24">{{ icon }}</v-icon>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-btn v-if="modelValue" color="error" rounded="lg" variant="tonal" @click="clearIcon">
            Quitar icono
          </v-btn>

          <v-spacer />

          <v-btn rounded="lg" variant="text" @click="dialogOpen = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
/** IconPicker — selector de iconos Material Design Icons con búsqueda y diálogo. Usado en: Categories */
import { computed, ref } from 'vue';

withDefaults(defineProps<{ modelValue?: string; id?: string }>(), { modelValue: '' });
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const dialogOpen = ref(false);
const search = ref('');

const icons = [
  'mdi-cash',
  'mdi-briefcase',
  'mdi-currency-usd',
  'mdi-wallet',
  'mdi-bank',
  'mdi-cash-multiple',
  'mdi-hand-coin',
  'mdi-trending-up',
  'mdi-gift',
  'mdi-sale',
  'mdi-account-cash',
  'mdi-chart-line',
  'mdi-food',
  'mdi-food-apple',
  'mdi-silverware',
  'mdi-silverware-fork-knife',
  'mdi-cart',
  'mdi-cart-outline',
  'mdi-shopping',
  'mdi-shopping-outline',
  'mdi-gas-station',
  'mdi-car',
  'mdi-home',
  'mdi-home-city',
  'mdi-lightning-bolt',
  'mdi-water',
  'mdi-fire',
  'mdi-cellphone',
  'mdi-laptop',
  'mdi-medical-bag',
  'mdi-hospital-box',
  'mdi-heart-pulse',
  'mdi-school',
  'mdi-book',
  'mdi-book-open-variant',
  'mdi-airplane',
  'mdi-train',
  'mdi-bus',
  'mdi-beach',
  'mdi-palette',
  'mdi-music',
  'mdi-dumbbell',
  'mdi-basketball',
  'mdi-tshirt-crew',
  'mdi-watch',
  'mdi-tools',
  'mdi-paw',
  'mdi-coffee',
  'mdi-glass-mug',
  'mdi-beer',
  'mdi-bottle-wine',
  'mdi-cake',
  'mdi-pizza',
  'mdi-hamburger',
  'mdi-noodles',
  'mdi-fridge',
  'mdi-sofa',
  'mdi-bed',
  'mdi-shower',
  'mdi-washing-machine',
];

const filteredIcons = computed(() => {
  if (!search.value) return icons;
  const q = search.value.toLowerCase();
  return icons.filter((i) => i.includes(q));
});

function selectIcon(icon: string) {
  emit('update:modelValue', icon);
  dialogOpen.value = false;
}

function clearIcon() {
  emit('update:modelValue', '');
  dialogOpen.value = false;
}
</script>
