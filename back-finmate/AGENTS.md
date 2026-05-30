# AGENTS.md — Instrucciones para Agentes

## Stack

Node.js, Express 5, TypeScript, MariaDB, Drizzle ORM, Zod, JWT (Access + Refresh), bcrypt, helmet, express-rate-limit, cookie-parser, dinero.js

## Arquitectura

- Modular Monolith, feature-based (`src/modules/<modulo>/`)
- Flujo: route → controller → service → repository → database
- Cada módulo independiente con sus propios archivos

## Reglas Obligatorias

- Cuando se creen end points nuevos actualizar el archivo readme.md
- Evitar complejidad enterprise innecesaria
- Aplicar principios SOLID siempre que sea razonable
- Validar toda entrada externa

### Variables de Entorno

- NUNCA hardcodear secretos, credenciales, tokens, urls, puertos — leer desde `.env`

### Código

- Funciones pequeñas, responsabilidad única, claridad sobre complejidad
- Textos al usuario en español | Usar Context7 MCP para docs de librerías
- Reglas de dinero.js en `.agents/skills/`

### Validación

- Toda entrada validada con Zod (body, params, query) — schemas dentro del módulo

### Base de Datos

- MariaDB + Drizzle ORM | snake_case, plural en tablas | timestamps obligatorios

### Autenticación

- Doble JWT: Access (15 min, header `Authorization: Bearer`) + Refresh (30 días, cookie HttpOnly, rotación obligatoria)
- Passwords con bcrypt (10 rounds) | Refresh tokens revocables desde tabla `refresh_tokens`

### Errores

- Middleware global + custom errors (`src/shared/errors/`) | Sin try/catch excesivo

### Testing

- Vitest (unit) + Supertest (HTTP)

## Comandos

| Comando               | Descripción                 |
| --------------------- | --------------------------- |
| `npm run dev`         | Servidor con hot-reload     |
| `npm run build`       | Compilar TypeScript         |
| `npm run start`       | Ejecutar compilado          |
| `npm run db:generate` | Generar migraciones         |
| `npm run db:migrate`  | Aplicar migraciones         |
| `npm run db:seed`     | Insertar datos de prueba    |
| `npm test`            | Ejecutar tests (vitest run) |
| `npm run test:watch`  | Tests en modo watch         |

## Estructura de Módulo

```
auth.controller.ts  auth.service.ts  auth.repository.ts
auth.routes.ts  auth.schema.ts  auth.types.ts
```
