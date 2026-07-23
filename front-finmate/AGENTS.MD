# Fin Mate - Frontend (Instrucciones para IA)

Aplicación web para administración de finanzas personales (ingresos/gastos), con modo pareja y gestión de deudas.

## Stack

Vue 3, Vite, TypeScript, Vuetify, Pinia, Vue Router, Axios, Vitest, ESLint, Zod

## Requisitos e Instalación

- Node.js v18+
- `npm install`
- Iniciar dev: `npm run dev`

## Variables de Entorno

| Variable            | Descripción          | Default                 |
| ------------------- | -------------------- | ----------------------- |
| `VITE_API_BASE_URL` | URL base del backend | `http://localhost:3000` |

## Comandos

| Comando            | Descripción                                       |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo con hot-reload             |
| `npm run build`    | Compilación producción                            |
| `npm run preview`  | Previsualizar build                               |
| `npm run lint`     | Ejecutar ESLint                                   |
| `npm run lint:fix` | Corregir errores ESLint                           |
| `npx eslint`       | **Usar esta** para verificar archivos específicos |
| `npx eslint --fix` | **Usar esta** para corregir archivos específicos  |

⚠️ **Importante**: Nunca ejecutar `npm run lint:fix`. Hace `prettier --write .` sobre **todos** los archivos y reformatea código no relacionado. En su lugar, usar `npx eslint --fix` solo sobre los archivos que se estén editando. Ejemplo:

```powershell
npx eslint --fix src/layouts/AuthLayout.vue src/styles/auth.css
```

| `npm run type-check` | Verificar tipos TypeScript |
| `npm run test` | Tests en modo watch |
| `npm run test:run` | Tests una sola vez |

## Estructura

```
src/
  main.ts                  Punto de entrada
  App.vue                  Componente raíz
  pages/                   Vistas (Login, Register, Dashboard, Profile, Categories, Movements, Debts)
  layouts/                 Layouts (AuthLayout)
  stores/                  Pinia (auth, categories, movements, debts)
  services/                api.ts — Axios + interceptors
  types/                   Interfaces TypeScript
  plugins/                 Vuetify, Router, Pinia
  router/                  Vue Router + auth guard
  styles/                  base.css, auth.css, unauth.css
  components/              Componentes reutilizables
  utils/                   format.ts — capitalizeFirst
  directives/              capitalizeFirst.ts — v-capitalize-first
  tests/                   Vitest
    auth.test.ts, categories.test.ts, movements.test.ts, debts.test.ts
    couples.test.ts, dashboard.test.ts, api-interceptor.test.ts, router-guard.test.ts
    components/ (DatePicker, IconPicker)
    pages/ (Login, Register)
    setup.ts, mocks/
```

## Reglas Obligatorias

1. **Idioma**: Todos los textos visibles al usuario en español.
2. **Documentación**: Usar MCP `context7` para consultar docs de librerías.
3. **README**: Si se crean nuevos endpoints, actualizar `README.md`.
4. **Complejidad**: Evitar complejidad innecesaria.
5. **SOLID**: Aplicar principios SOLID cuando sea razonable.
6. **Consola**: No usar emojis en textos de consola.
7. **Módulos**: Cada módulo nuevo va en una categoría nueva en el drawer.
8. **Autenticación**: Toda página del drawer requiere usuario autenticado.
9. **CSS** — Tres archivos: `styles/base.css` (compartido), `styles/unauth.css` (LandingPage, HowItWorks, Login, Register) y `styles/auth.css` (Dashboard, Profile, Categories, Movements, Debts, Couples + AuthLayout). No dispersar estilos en componentes ni crear otros archivos CSS.
   - **Siempre usar variables CSS existentes** del `:root`. Nunca hardcodear colores, opacidades o `font-family` que ya tengan variable.
   - **Si necesitas una variante de opacidad** de un color existente, usa el tier más cercano ya definido (`.05`, `.10`, `.15`, `.25`, `.40`, `.50`, `.55`, `.65`, `.80`). No añadas opacidades nuevas.
   - **Si agregas un nuevo color**, añádelo como variable en `:root` con nombre semántico (`--green-dark`, `--red`, etc.) y reutilízalo en lugar de repetir el hex.
   - **No uses** `rgba(r, g, b, x)` directamente — usa las variables `--color-xx` predefinidas.
   - **Actualiza** `:root` primero antes de usar una nueva variable en el resto del archivo.
10. **Tests**: Escribir en `src/tests/` con el mismo nombre del módulo.
11. **Prioridad tests**: Stores y servicios primero; componentes y páginas después.
12. **Diálogos**: Solo dos tamaños de `max-width` — `800` para `DebtPayoffModal` (Plan de pago) y `540` para el resto. Siempre incluir botón X de cierre en el título con el patrón `d-flex align-center` + `<v-spacer />` + `<v-btn icon variant="text" @click="..."><v-icon>mdi-close</v-icon></v-btn>`.

## Autenticación

- **Access Token**: JWT 15 min, solo en memoria (Pinia). Header: `Authorization: Bearer <token>`.
- **Refresh Token**: JWT 30 días, cookie HttpOnly. Renovación automática.
- **Login/Register**: Backend setea cookie HttpOnly y retorna access token en body.
- **Interceptor**: Errores 401 → refresh automático antes de reintentar.
- **Logout**: Revoca refresh token en backend + limpia memoria.
- **Persistencia**: Sin localStorage para tokens.
- **Rutas protegidas**: Auth guard protege todo salvo login, register, landing y recuperación.

## Validaciones

Todas las entradas con **Zod**.

- **Capitalización**: Todo texto ingresado por el usuario (`name`, `title`, `description`, `notes`) se transforma con `capitalizeFirst` vía Zod `.transform()` + directiva `v-capitalize-first` para feedback en tiempo real

## Seguridad

- Validar toda entrada externa.
- No exponer errores internos en producción.
- Implementado: `logout-all`, `forgot-password`, `reset-password`, `verify-email`.

## Módulos

| Módulo                                           | Estado |
| ------------------------------------------------ | ------ |
| Auth (login, register, profile, refresh, logout) | ✅     |
| Categories (CRUD + tabs por tipo)                | ✅     |
| Movements (CRUD + filtros + paginación)          | ✅     |
| Debts + Payments                                 | ✅     |
| Couples + Goals                                  | ✅     |
| Dashboard (resumen + gráficos)                   | ✅     |

## Dashboard

- Resumen del mes: ingresos, gastos, balance vs mes anterior
- Gráfico evolución mensual (Chart.js Line — últimos 12 meses)
- Distribución por categoría (Chart.js Doughnut)
- Balance por mes (Chart.js Bar — últimos 12 meses)
- Últimos 5 movimientos
- Resumen deudas activas
- Progreso metas de pareja (si hay grupo)
- Fuente: `GET /dashboard/summary`

## Modo Pareja

- Crear/unirse a grupo
- Invitar por email
- Metas compartidas: CRUD + contribuciones
- Abandonar o disolver grupo
