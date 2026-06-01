# Fin Mate - Finanzas Personales

Administrador de finanzas personales, ingresos y gastos, con modo de finanzas de pareja y consejos para administrar deudas.

## Stack Tecnológico

Node.js, Express 5, TypeScript, MariaDB, Drizzle ORM, Zod, JWT (Access + Refresh), bcrypt, cookie-parser, dinero.js

## Requisitos

- Node.js v18+
- MariaDB 10+
- npm

## Instalación

1. Clonar el repositorio
2. `npm install`
3. Copiar `.env.example` a `.env` y configurar variables
4. Generar `JWT_SECRET` y pegarlo en `.env`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. Generar migraciones: `npm run db:generate`
6. Aplicar migraciones: `npm run db:migrate`
7. Insertar datos de prueba: `npm run db:seed`
8. Iniciar servidor: `npm run dev`

## Variables de Entorno

Ver `.env.example` para la lista completa con descripciones. Las secciones incluyen:

- **Servidor**: `PORT`, `NODE_ENV`, `FRONTEND_URL`
- **Base de Datos**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`
- **Rate Limiting**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS`, `JWT_REFRESH_EXPIRES_IN_SECONDS`

## Comandos Útiles

| Comando               | Descripción                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `npm run dev`         | Inicia servidor con hot-reload + limpieza automática de tokens expirados |
| `npm run build`       | Compila TypeScript a JS                                                  |
| `npm run start`       | Ejecuta compilado en producción                                          |
| `npm run db:generate` | Genera migraciones desde el schema                                       |
| `npm run db:migrate`  | Aplica migraciones pendientes a MariaDB                                  |
| `npm run db:seed`     | Inserta datos de prueba (2 usuarios, 4 categorías)                       |
| `npm test`            | Ejecuta todos los tests (vitest run)                                     |
| `npm run test:watch`  | Ejecuta tests en modo watch (vitest)                                     |

## Limpieza de Tokens

Los refresh tokens se acumulan en la tabla `refresh_tokens` con cada login y rotación.
Para evitar crecimiento innecesario, el servidor ejecuta una limpieza automática al iniciar:

- **Archivo**: `src/shared/database/cleanup.ts`
- **Cuándo**: Cada vez que arranca el servidor (`npm run dev` o `npm start`)
- **Qué elimina**:
  - Tokens cuya fecha de expiración ya pasó (`expires_at < NOW()`)
  - Tokens revocados con más de 7 días de antigüedad
- **Comportamiento**: Envuelto en try/catch — si falla, no bloquea el inicio del servidor y solo muestra una advertencia en consola

## Endpoints Activos

### Auth

| Método | Ruta               | Body / Headers / Cookies                                | Respuesta                            |
| ------ | ------------------ | ------------------------------------------------------- | ------------------------------------ |
| POST   | `/auth/register`   | `{ name, email, password }`                             | 201 `{ accessToken, user }` + cookie |
| POST   | `/auth/login`      | `{ email, password }`                                   | 200 `{ accessToken, user }` + cookie |
| POST   | `/auth/refresh`    | Cookie `refreshToken` (HttpOnly)                        | 200 `{ accessToken }` + nueva cookie |
| POST   | `/auth/logout`     | `Authorization: Bearer <token>` + Cookie `refreshToken` | 200 `{ success }` + cookie limpiada  |
| POST   | `/auth/logout-all` | `Authorization: Bearer <token>` + Cookie `refreshToken` | 200 `{ success }` + cookie limpiada  |

**Flujo de autenticación:**

- **Access Token**: JWT de 15 minutos, enviado en header `Authorization: Bearer`. Nunca se almacena en base de datos.
- **Refresh Token**: JWT de 30 días, almacenado en cookie HttpOnly (`Path=/auth`). Se rota en cada uso.
- **Logout**: Revoca el refresh token actual en base de datos.
- **Logout-all**: Revoca todos los refresh tokens del usuario.
- Las rutas protegidas validan únicamente el Access Token (stateless, sin consultas a BD).

### Categories

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta              | Body / Query                                                 | Respuesta                |
| ------ | ----------------- | ------------------------------------------------------------ | ------------------------ |
| GET    | `/categories`     | `?type=income\|expense`                                      | 200 `CategoryResponse[]` |
| GET    | `/categories/:id` | —                                                            | 200 `CategoryResponse`   |
| POST   | `/categories`     | `{ name, type, icon?, color?, parentId?, sortOrder? }`       | 201 `CategoryResponse`   |
| PATCH  | `/categories/:id` | `{ name?, icon?, color?, parentId?, sortOrder?, isActive? }` | 200 `CategoryResponse`   |
| DELETE | `/categories/:id` | —                                                            | 204 Sin contenido        |

### Health

| Método | Ruta    | Respuesta                             |
| ------ | ------- | ------------------------------------- |
| GET    | `/ping` | 200 `{ status, httpCode, timestamp }` |

## Arquitectura

Modular Monolith con flujo `route → controller → service → repository → database`. Cada módulo es independiente dentro de `src/modules/<modulo>/` con sus propios archivos de rutas, controlador, servicio, repositorio, schema de validación y tipos.

## Pendientes

Funcionalidades planificadas para futuras iteraciones:

- **Cambio de contraseña** — Endpoint para cambiar contraseña estando autenticado
- **Recuperación de contraseña** — Flujo "olvidé mi contraseña" con envío de email
- **Verificación de email** — Confirmación de email al registrarse
- **Módulo Movements** — CRUD de movimientos financieros (ingresos/gastos) con filtros por fecha, tipo, categoría y paginación
- **Módulo Couples** — Gestión de parejas/grupos: crear, invitar/aceptar, abandonar, roles (owner/member)
- **Módulo Debts** — CRUD de deudas con prioridad, tasa de interés, estado (pending/paid/overdue)
- **Sub-módulo Debt Payments** — Registrar pagos a deudas, actualizar `current_amount` automáticamente
- **Eliminar endpoint GET / redundante** — La ruta raíz con `¡Hola Mundo!` es cubierta por `GET /ping`
