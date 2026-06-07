// Types
import type { App } from 'vue';
import { createPinia } from 'pinia';
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

import router from '../router';
// Plugins
import vuetify from './vuetify';
import { vCapitalizeFirst } from '@/directives/capitalizeFirst';

export function registerPlugins(app: App) {
  app.use(vuetify);
  app.use(createPinia());
  app.use(router);
  app.directive('capitalize-first', vCapitalizeFirst);
}
