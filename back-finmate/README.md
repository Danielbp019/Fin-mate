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

| Método | Ruta                    | Body / Headers / Cookies                                             | Respuesta                            |
| ------ | ----------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| POST   | `/auth/register`        | `{ name, email, password }`                                          | 201 `{ accessToken, user }` + cookie |
| POST   | `/auth/login`           | `{ email, password }`                                                | 200 `{ accessToken, user }` + cookie |
| POST   | `/auth/refresh`         | Cookie `refreshToken` (HttpOnly)                                     | 200 `{ accessToken }` + nueva cookie |
| POST   | `/auth/logout`          | `Authorization: Bearer <token>` + Cookie `refreshToken`              | 200 `{ success }` + cookie limpiada  |
| POST   | `/auth/logout-all`      | `Authorization: Bearer <token>` + Cookie `refreshToken`              | 200 `{ success }` + cookie limpiada  |
| PATCH  | `/auth/profile`         | `Authorization: Bearer <token>` + `{ name }`                         | 200 `{ id, name, email }`            |
| POST   | `/auth/change-password` | `Authorization: Bearer <token>` + `{ currentPassword, newPassword }` | 200 `{ message }`                    |

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

### Movements

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta             | Body / Query                                                              | Respuesta                  |
| ------ | ---------------- | ------------------------------------------------------------------------- | -------------------------- |
| GET    | `/movements`     | `?type, ?categoryId, ?from, ?to, ?page, ?limit`                           | 200 `{ data, pagination }` |
| GET    | `/movements/:id` | —                                                                         | 200 `MovementResponse`     |
| POST   | `/movements`     | `{ categoryId, type, amount, description?, movementDate, isShared? }`     | 201 `MovementResponse`     |
| PATCH  | `/movements/:id` | `{ categoryId?, type?, amount?, description?, movementDate?, isShared? }` | 200 `MovementResponse`     |
| DELETE | `/movements/:id` | —                                                                         | 204 Sin contenido          |

### Debts

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta         | Body / Query                                                                                                                                  | Respuesta            |
| ------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| GET    | `/debts`     | `?status, ?priority`                                                                                                                          | 200 `DebtResponse[]` |
| GET    | `/debts/:id` | —                                                                                                                                             | 200 `DebtResponse`   |
| POST   | `/debts`     | `{ title, description?, initialAmount, interestRate?, minimumPayment?, dueDay?, priority?, startDate? }`                                      | 201 `DebtResponse`   |
| PATCH  | `/debts/:id` | `{ title?, description?, initialAmount?, currentAmount?, interestRate?, minimumPayment?, dueDay?, priority?, status?, startDate?, endDate? }` | 200 `DebtResponse`   |
| DELETE | `/debts/:id` | —                                                                                                                                             | 204 Sin contenido    |

### Debt Payments (dentro de Debts)

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta                      | Body / Query                      | Respuesta               |
| ------ | ------------------------- | --------------------------------- | ----------------------- |
| GET    | `/debts/:debtId/payments` | —                                 | 200 `PaymentResponse[]` |
| POST   | `/debts/:debtId/payments` | `{ amount, paymentDate, notes? }` | 201 `PaymentResponse`   |

### Health

| Método | Ruta    | Respuesta                             |
| ------ | ------- | ------------------------------------- |
| GET    | `/ping` | 200 `{ status, httpCode, timestamp }` |

## Arquitectura

Modular Monolith con flujo `route → controller → service → repository → database`. Cada módulo es independiente dentro de `src/modules/<modulo>/` con sus propios archivos de rutas, controlador, servicio, repositorio, schema de validación y tipos.

### Estructura de módulo estándar

```
src/modules/<modulo>/
  <modulo>.controller.ts
  <modulo>.service.ts
  <modulo>.repository.ts
  <modulo>.routes.ts
  <modulo>.schema.ts
  <modulo>.types.ts
  tests/
```

### Sub-módulos

Cuando una feature tiene una tabla hija y lógica de negocio separada (ej. Debt Payments dentro de Debts), se agrupa en subdirectorio dentro del módulo padre con sus propios controller/service/repository/schema. Las rutas del sub-módulo se montan desde el router del módulo padre.

```
src/modules/debts/
  debts.controller.ts / debts.service.ts / ...  (padre)
  payments/                                      (sub-módulo)
    payments.controller.ts / payments.service.ts / ...
```

## Pendientes

Funcionalidades planificadas para futuras iteraciones:

### Couples (src/modules/couples/)

Gestion de finanzas compartidas. Tablas `couples` y `couple_members` ya existen en schema de Drizzle.

| Metodo | Ruta                  | Descripcion                         |
| ------ | --------------------- | ----------------------------------- |
| POST   | `/couples`            | Crear grupo (el creador es `owner`) |
| POST   | `/couples/:id/invite` | Invitar usuario por email           |
| POST   | `/couples/:id/join`   | Aceptar invitacion                  |
| DELETE | `/couples/:id/leave`  | Abandonar grupo                     |
| DELETE | `/couples/:id`        | Disolver grupo (solo owner)         |

- Un usuario solo puede pertenecer a un grupo activo a la vez
- El `owner` no puede abandonar sin disolver (puede transferir ownership)

### Cuenta (features de auth pendientes)

Funcionalidades futuras que extienden el modulo `auth`:

| Metodo | Ruta                    | Descripcion                                    |
| ------ | ----------------------- | ---------------------------------------------- |
| POST   | `/auth/forgot-password` | Enviar email con token de recuperacion         |
| POST   | `/auth/reset-password`  | Resetear contrasena con token                  |
| POST   | `/auth/verify-email`    | Verificar email con token enviado al registrar |

- Tabla nueva `password_reset_tokens` (o similar) si se implementa forgot-password
- Verificacion de email puede ser un campo `emailVerifiedAt` en `users`

## Modulos Existentes

| Modulo     | Archivos                  |
| ---------- | ------------------------- |
| Auth       | `src/modules/auth/`       |
| Categories | `src/modules/categories/` |
| Movements  | `src/modules/movements/`  |
| Debts      | `src/modules/debts/`      |
| Ping       | `src/modules/ping/`       |
