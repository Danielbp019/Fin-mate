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
  stores/               Stores de Pinia
  services/             Servicios (Axios + interceptors)
  types/                Interfaces TypeScript
  plugins/              Configuración de plugins
  router/               Rutas + auth guard
  styles/               Estilos globales (theme.css)
  components/           Componentes reutilizables
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
