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

| Comando              | Descripción                           |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Servidor de desarrollo con hot-reload |
| `npm run build`      | Compilación producción                |
| `npm run preview`    | Previsualizar build                   |
| `npm run lint`       | Ejecutar ESLint                       |
| `npm run lint:fix`   | Corregir errores ESLint               |
| `npm run type-check` | Verificar tipos TypeScript            |
| `npm run test`       | Tests en modo watch                   |
| `npm run test:run`   | Tests una sola vez                    |

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
  styles/                  theme.css (único archivo de estilos)
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
9. **CSS**: Un solo archivo: `styles/theme.css`. No dispersar estilos.
10. **Tests**: Escribir en `src/tests/` con el mismo nombre del módulo.
11. **Prioridad tests**: Stores y servicios primero; componentes y páginas después.

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

## Pendientes / Bugs

- **Pareja**: texto no usa `theme.css`, no se adapta a claro/oscuro
- **Buscadores**: deudas y movimientos deben ser instantáneos (no por botón)
- **Movimientos**: falta columna explícita ingreso/gasto
- **Filtro fechas**: si se automatiza, conservar opción manual
