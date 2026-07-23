# Fin Mate - Finanzas Personales (Frontend)

Aplicación web para administración de finanzas personales: control de ingresos y gastos, gestión de deudas, y modo pareja con metas compartidas.

## Stack Tecnológico

Vue 3, Vite, TypeScript, Vuetify, Pinia, Vue Router, Axios, Vitest, ESLint, Zod

## Requisitos

- Node.js v18+
- npm

## Instalación

```bash
npm install
npm run dev
```

## Variables de Entorno

| Variable            | Descripción          | Default                 |
| ------------------- | -------------------- | ----------------------- |
| `VITE_API_BASE_URL` | URL base del backend | `http://localhost:3000` |

## Comandos

| Comando                 | Descripción                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Servidor de desarrollo con hot-reload |
| `npm run build`         | Compilación producción                |
| `npm run preview`       | Previsualizar build                   |
| `npm run lint`          | Ejecutar ESLint                       |
| `npm run lint:fix`      | Corregir errores ESLint               |
| `npm run type-check`    | Verificar tipos TypeScript            |
| `npm run test`          | Tests en modo watch                   |
| `npm run test:run`      | Tests una sola vez                    |
| `npm run test:coverage` | Tests con cobertura                   |

## Estructura del Proyecto

```
src/
  main.ts               Punto de entrada
  App.vue               Componente raíz
  pages/                Vistas (Login, Register, Dashboard, Profile, Categories, Movements, Debts)
  layouts/              Layouts compartidos
  stores/               Stores de Pinia (auth, categories, movements, debts, couples, dashboard, debtAdvisor)
  services/             Servicios (Axios + interceptors)
  types/                Interfaces TypeScript
  plugins/              Configuración de plugins
  router/               Rutas + auth guard
  styles/               Estilos globales
    base.css              Variables y reset compartidos
    auth.css              Páginas autenticadas (Dashboard, Profile, etc.)
    unauth.css            Páginas públicas (Landing, HowItWorks, Login, Register)
  components/           Componentes reutilizables
  utils/                Utilitarios (format.ts — capitalizeFirst)
  directives/           Directivas Vue (capitalizeFirst.ts)
  tests/                Tests unitarios (Vitest)
public/                 Archivos estáticos
```

## Autenticación

- **Access Token**: JWT de 15 min, almacenado en memoria (Pinia), enviado vía `Authorization: Bearer`
- **Refresh Token**: JWT de 30 días en cookie HttpOnly, renovación automática
- **Login/Register**: El backend setea la cookie HttpOnly y retorna el access token
- **Interceptor**: Detecta errores 401 e intenta refresh automático
- **Logout**: Revoca el refresh token y limpia el estado en memoria
- **Persistencia**: No se usa localStorage para tokens
- **Rutas protegidas**: Todas las rutas salvo login, register, landing y recuperación de cuenta

## Módulos

| Módulo                                           | Estado |
| ------------------------------------------------ | ------ |
| Auth (login, register, profile, refresh, logout) | ✅     |
| Categories (CRUD + tabs por tipo)                | ✅     |
| Movements (CRUD + filtros + paginación)          | ✅     |
| Debts + Payments                                 | ✅     |

| Couples + Goals                                  | ✅     |
| Dashboard (resumen + gráficos)                   | ✅     |

## Capitalización Automática de Texto

Toda entrada de texto del usuario (nombre, título, descripción, notas) se capitaliza automáticamente para mantener consistencia en los datos. Se implementa en dos capas:

### `src/utils/format.ts` — `capitalizeFirst`

Función utilitaria que convierte la primera letra en mayúscula:

```ts
capitalizeFirst('hola mundo'); // → 'Hola mundo'
capitalizeFirst(''); // → ''
```

Se aplica como `.transform(capitalizeFirst)` en los schemas de Zod. Esto asegura que al guardar cualquier formulario el texto quede capitalizado, incluso si el usuario escribe en minúsculas.

### `src/directives/capitalizeFirst.ts` — `v-capitalize-first`

Directiva Vue que capitaliza en **tiempo real mientras el usuario escribe**:

1. Al montarse, busca el `<input>` / `<textarea>` nativo dentro del componente Vuetify
2. Escucha el evento `input` y capitaliza la primera letra al instante si está en minúscula
3. Dispara un nuevo `input` para que Vue/Vuetify actualice el `v-model`
4. Preserva la posición del cursor para no interrumpir la escritura

**Flujo completo:** Zod garantiza la capitalización en la capa de datos; `v-capitalize-first` da feedback visual inmediato en la capa de UX. Ambas son complementarias.
