/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify';
// Locale
import { es } from 'vuetify/locale';
// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: 'es-CO',
    messages: { 'es-CO': es },
  },
  date: {
    locale: { 'es-CO': 'es-CO' },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#fafafa',
          surface: '#f0f2f0',
        },
      },
    },
  },
  defaults: {
    VOverlay: { scrollStrategy: 'none' },
    VDialog: { scrollStrategy: 'none' },
    VLabel: { style: 'font-size: 14px; font-weight: 500;' },
    VBtn: { style: 'font-size: 14px; font-weight: 500;' },
    VTextField: { style: 'font-size: 14px;' },
    VSelect: { style: 'font-size: 14px;' },
    VCard: { style: 'font-size: 15px; line-height: 1.6;' },
    VListItem: { style: 'font-size: 14px;' },
    VListSubheader: { style: 'font-size: 14px;' },
    VMenu: { style: 'font-size: 14px;' },
    VDataTable: { style: 'font-size: 14px;' },
  },
});
