# Fin Mate - Finanzas Personales

Administrador de finanzas personales, ingresos y gastos, con modo de finanzas de pareja y consejos para administrar deudas.

## Stack Tecnológico

Node.js, Express 5, TypeScript, MariaDB, Drizzle ORM, Zod, JWT (Access + Refresh), bcrypt, cookie-parser, dinero.js

## Requisitos

- Node.js v18+
- MariaDB 10+
- pnpm

## Instalación

1. Clonar el repositorio
2. `pnpm install`
3. Copiar `.env.example` a `.env` y configurar variables
4. Generar `JWT_SECRET` y pegarlo en `.env`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. Generar migraciones: `pnpm run db:generate`
6. Aplicar migraciones: `pnpm run db:migrate`
7. Insertar datos de prueba: `pnpm run db:seed`
8. Iniciar servidor: `pnpm run dev`

## Variables de Entorno

Ver `.env.example` para la lista completa con descripciones. Las secciones incluyen:

- **Servidor**: `PORT`, `NODE_ENV`, `FRONTEND_URL`
- **Base de Datos**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`
- **Rate Limiting**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS`, `JWT_REFRESH_EXPIRES_IN_SECONDS`
- **Email (SMTP)**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

## Comandos Útiles

| Comando                | Descripción                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run dev`         | Inicia servidor con hot-reload + limpieza automática de tokens expirados                                                    |
| `pnpm run build`       | Compila TypeScript a JS                                                                                                     |
| `pnpm run start`       | Ejecuta compilado en producción                                                                                             |
| `pnpm run db:generate` | Genera migraciones desde el schema                                                                                          |
| `pnpm run db:migrate`  | Aplica migraciones pendientes a MariaDB                                                                                     |
| `pnpm run db:seed`     | Inserta datos de prueba (2 usuarios, 10 categorias, 16 movimientos, 4 deudas, 6 pagos, 1 pareja, 2 metas, 4 contribuciones) |
| `pnpm test`            | Ejecuta todos los tests (vitest run)                                                                                        |
| `pnpm run test:watch`  | Ejecuta tests en modo watch (vitest)                                                                                        |

## Limpieza de Tokens

Los refresh tokens se acumulan en la tabla `refresh_tokens` con cada login y rotación.
Para evitar crecimiento innecesario, el servidor ejecuta una limpieza automática:

- **Archivo**: `src/shared/database/cleanup.ts`
- **Cuándo**: Al iniciar el servidor (`pnpm run dev` o `pnpm start`) y cada 6 horas automáticamente
- **Qué elimina**:
  - Tokens cuya fecha de expiración ya pasó (`expires_at < NOW()`)
  - Tokens revocados con más de 7 días de antigüedad
- **Comportamiento**: Envuelto en try/catch — si falla, no bloquea el inicio del servidor y solo muestra una advertencia en consola

## Rotación de Tokens

El sistema implementa **rotación de refresh tokens** por seguridad:

- Cada vez que se llama a `POST /auth/refresh`, el refresh token anterior se revoca en base de datos y se emite uno nuevo en una nueva cookie HttpOnly
- El access token (JWT de 15 minutos) se almacena solo en memoria (Pinia) — nunca se persiste en localStorage/sessionStorage por protección contra XSS
- Al recargar la página, el access token en memoria se pierde. El router guard detecta que no hay token y llama a `/auth/refresh` para obtener uno nuevo usando la cookie HttpOnly
- Esto significa que **cada recarga de página genera un nuevo refresh token** (el anterior se revoca). Es comportamiento esperado y deseado por seguridad
- Los tokens revocados se conservan 7 días antes de ser eliminados automáticamente por la limpieza programada
- Si un refresh token es robado y usado por un atacante, el token legítimo quedará revocado al rotarse, invalidando el uso malicioso

## Endpoints Activos

### Auth

| Método | Ruta                    | Body / Headers / Cookies                                             | Respuesta                            |
| ------ | ----------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| POST   | `/auth/register`        | `{ name, email, password }`                                          | 201 `{ accessToken, user }` + cookie |
| POST   | `/auth/login`           | `{ email, password }`                                                | 200 `{ accessToken, user }` + cookie |
| POST   | `/auth/refresh`         | Cookie `refreshToken` (HttpOnly)                                     | 200 `{ accessToken }` + nueva cookie |
| POST   | `/auth/logout`          | `Authorization: Bearer <token>` + Cookie `refreshToken`              | 200 `{ success }` + cookie limpiada  |
| POST   | `/auth/logout-all`      | `Authorization: Bearer <token>` + Cookie `refreshToken`              | 200 `{ success }` + cookie limpiada  |
| POST   | `/auth/forgot-password` | `{ email }`                                                          | 200 `{ message }`                    |
| POST   | `/auth/reset-password`  | `{ token, newPassword }`                                             | 200 `{ message }`                    |
| POST   | `/auth/verify-email`    | `{ token }`                                                          | 200 `{ message }`                    |
| PATCH  | `/auth/profile`         | `Authorization: Bearer <token>` + `{ name }`                         | 200 `{ id, name, email }`            |
| POST   | `/auth/change-password` | `Authorization: Bearer <token>` + `{ currentPassword, newPassword }` | 200 `{ message }`                    |

**Flujo de autenticación:**

- **Access Token**: JWT de 15 minutos, enviado en header `Authorization: Bearer`. Nunca se almacena en base de datos.
- **Refresh Token**: JWT de 30 días, almacenado en cookie HttpOnly (`Path=/auth`). Se rota en cada uso.
- **Logout**: Revoca el refresh token actual en base de datos.
- **Logout-all**: Revoca todos los refresh tokens del usuario.
- Las rutas protegidas validan únicamente el Access Token (stateless, sin consultas a BD).
- `forgot-password` y `reset-password`: flujo de recuperacion con token unico de 15 minutos almacenado en `password_reset_tokens`.
- `verify-email`: al registrarse se envia un email con un JWT de 24h. El campo `emailVerifiedAt` en `users` registra la verificacion.

## Email

El envio de correos se maneja via `src/shared/email/` usando **Nodemailer**.

- **Desarrollo**: usa Ethereal Email (SMTP fake). Los emails se capturan y se muestra una URL de previsualizacion en la consola.
- **Produccion**: configurar via `.env` con un SMTP real (SendGrid, Mailgun, Resend, etc).
- **Templates HTML**: `email.templates.ts` contiene los templates inline para verificacion, recuperacion de contrasena e invitacion a grupo.

### Categories

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta              | Body / Query                                   | Respuesta                |
| ------ | ----------------- | ---------------------------------------------- | ------------------------ |
| GET    | `/categories`     | `?type=income\|expense`                        | 200 `CategoryResponse[]` |
| GET    | `/categories/:id` | —                                              | 200 `CategoryResponse`   |
| POST   | `/categories`     | `{ name, type, icon?, parentId?, sortOrder? }` | 201 `CategoryResponse`   |
| PATCH  | `/categories/:id` | `{ name?, icon?, parentId?, sortOrder? }`      | 200 `CategoryResponse`   |
| DELETE | `/categories/:id` | —                                              | 204 Sin contenido        |

### Movements

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta             | Body / Query                                                   | Respuesta                  |
| ------ | ---------------- | -------------------------------------------------------------- | -------------------------- |
| GET    | `/movements`     | `?type, ?categoryId, ?from, ?to, ?page, ?limit`                | 200 `{ data, pagination }` |
| GET    | `/movements/:id` | —                                                              | 200 `MovementResponse`     |
| POST   | `/movements`     | `{ categoryId, type, amount, description?, movementDate }`     | 201 `MovementResponse`     |
| PATCH  | `/movements/:id` | `{ categoryId?, type?, amount?, description?, movementDate? }` | 200 `MovementResponse`     |
| DELETE | `/movements/:id` | —                                                              | 204 Sin contenido          |

### Debts

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta         | Body / Query                                                                                                                                                      | Respuesta            |
| ------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| GET    | `/debts`     | `?status, ?priority`                                                                                                                                              | 200 `DebtResponse[]` |
| GET    | `/debts/:id` | —                                                                                                                                                                 | 200 `DebtResponse`   |
| POST   | `/debts`     | `{ title, description?, initialAmount, interestRate?, interestRateType?, minimumPayment?, dueDate?, priority?, startDate? }`                                      | 201 `DebtResponse`   |
| PATCH  | `/debts/:id` | `{ title?, description?, initialAmount?, currentAmount?, interestRate?, interestRateType?, minimumPayment?, dueDate?, priority?, status?, startDate?, endDate? }` | 200 `DebtResponse`   |
| DELETE | `/debts/:id` | —                                                                                                                                                                 | 204 Sin contenido    |

### Debt Payments (dentro de Debts)

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta                      | Body / Query                      | Respuesta               |
| ------ | ------------------------- | --------------------------------- | ----------------------- |
| GET    | `/debts/:debtId/payments` | —                                 | 200 `PaymentResponse[]` |
| POST   | `/debts/:debtId/payments` | `{ amount, paymentDate, notes? }` | 201 `PaymentResponse`   |

### Couples

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta                  | Body / Headers | Respuesta                |
| ------ | --------------------- | -------------- | ------------------------ |
| GET    | `/couples`            | —              | 200 `CoupleResponse`     |
| POST   | `/couples`            | `{ name }`     | 201 `CoupleResponse`     |
| PATCH  | `/couples/:id`        | `{ name }`     | 200 `CoupleResponse`     |
| POST   | `/couples/:id/invite` | `{ email }`    | 201 `InvitationResponse` |
| POST   | `/couples/:id/join`   | —              | 200 `CoupleResponse`     |
| DELETE | `/couples/:id/leave`  | —              | 200 `{ message }`        |
| DELETE | `/couples/:id`        | —              | 200 `{ message }`        |

### Debt Advisor

Requiere `Authorization: Bearer <token>`.

| Método | Ruta                         | Query                               | Respuesta                 |
| ------ | ---------------------------- | ----------------------------------- | ------------------------- |
| GET    | `/debt-advisor/plan`         | `?monthlyExtraPayment=500000`       | 200 `AdvisorPlanResponse` |
| GET    | `/debt-advisor/debt/:debtId` | `?monthlyPayment=500000` (opcional) | 200 `DebtPayoffPlan`      |

**`/debt-advisor/plan`**: genera un plan de pago personalizado comparando 4 estrategias (avalancha, bola de nieve, por prioridad, solo mínimos) e incluye consejos financieros contextuales. No requiere base de datos propia — lee las deudas activas del repositorio y ejecuta los cálculos en memoria.

**`/debt-advisor/debt/:debtId`**: calcula escenarios de pago para una deuda específica (solo mínimos, recomendado y personalizado) con fecha estimada de finalización. Usado desde el modal de plan de pago en la interfaz.

### Dashboard

Requiere `Authorization: Bearer <token>`.

| Método | Ruta                 | Respuesta              |
| ------ | -------------------- | ---------------------- |
| GET    | `/dashboard/summary` | 200 `DashboardSummary` |

**Respuesta:**

```json
{
  "currentMonth": { "totalIncome": "5000.00", "totalExpense": "3200.00", "balance": "1800.00" },
  "comparison": { "incomeChange": 12, "expenseChange": -5 },
  "incomeByCategory": [
    {
      "categoryId": "...",
      "categoryName": "Salario",
      "icon": "mdi-briefcase",
      "total": "5000.00"
    }
  ],
  "expenseByCategory": [
    {
      "categoryId": "...",
      "categoryName": "Comida",
      "icon": "mdi-food",
      "total": "1200.00"
    }
  ],
  "monthlyBalance": [
    { "month": "2026-01", "income": "4800.00", "expense": "3100.00", "balance": "1700.00" }
  ],
  "recentMovements": [
    {
      "id": "...",
      "type": "income",
      "amount": "5000.00",
      "categoryName": "Salario",
      "categoryIcon": "mdi-briefcase",
      "description": null,
      "movementDate": "2026-06-01T..."
    }
  ],
  "activeDebts": { "count": 2, "totalRemaining": "15000.00" },
  "coupleGoals": { "active": 1, "totalProgress": 45 }
}
```

### Couple Goals (dentro de Couples)

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta                                      | Body / Query                                    | Respuesta                  |
| ------ | ----------------------------------------- | ----------------------------------------------- | -------------------------- |
| GET    | `/couples/:coupleId/goals`                | —                                               | 200 `GoalResponse[]`       |
| POST   | `/couples/:coupleId/goals`                | `{ title, targetAmount, deadline? }`            | 201 `GoalResponse`         |
| PATCH  | `/couples/:coupleId/goals/:id`            | `{ title?, targetAmount?, deadline?, status? }` | 200 `GoalResponse`         |
| DELETE | `/couples/:coupleId/goals/:id`            | —                                               | 204 Sin contenido          |
| POST   | `/couples/:coupleId/goals/:id/contribute` | `{ amount, notes?, date? }`                     | 201 `ContributionResponse` |

- Contribuir a una meta auto-genera un `movement` tipo `expense` con categoría "Ahorro Meta de Pareja"
- Al disolver el grupo, las metas activas con aportes se cancelan y generan un `movement` tipo `income` con categoría "Devolucion Meta de Pareja"
- Las metas completadas no se ven afectadas por la disolución

- Un usuario solo puede pertenecer a un grupo activo a la vez
- El `owner` no puede abandonar sin disolver
- Al disolver, los registros compartidos se desvinculan (`couple_id = NULL`) sin borrar datos financieros

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

## Modulos Existentes

| Modulo       | Archivos                     |
| ------------ | ---------------------------- |
| Auth         | `src/modules/auth/`          |
| Categories   | `src/modules/categories/`    |
| Movements    | `src/modules/movements/`     |
| Debts        | `src/modules/debts/`         |
| Couples      | `src/modules/couples/`       |
| Couple Goals | `src/modules/couples/goals/` |
| Debt Advisor | `src/modules/debt-advisor/`  |
| Dashboard    | `src/modules/dashboard/`     |
| Ping         | `src/modules/ping/`          |
