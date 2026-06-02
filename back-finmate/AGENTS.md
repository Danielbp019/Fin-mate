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
- No uses nunca iconos en textos informativos de consola
- La aplicación debe seguir la lógica financiera en movimientos de dinero y operaciones

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

### Módulo estándar (plano)

```
src/modules/<modulo>/
  <modulo>.controller.ts
  <modulo>.service.ts
  <modulo>.repository.ts
  <modulo>.routes.ts
  <modulo>.schema.ts      # Schemas de validación Zod
  <modulo>.types.ts       # Tipos compartidos
  tests/
    <modulo>.service.test.ts
    <modulo>.controller.test.ts
    <modulo>.routes.test.ts
    <modulo>.schema.test.ts
```

### Módulo con sub-módulo

Cuando una feature tiene lógica hija con su propia tabla y responsabilidades (ej. Debt Payments dentro de Debts), se estructura en subdirectorio:

```
src/modules/debts/
  debts.controller.ts
  debts.service.ts
  debts.repository.ts
  debts.schema.ts
  debts.routes.ts
  debts.types.ts
  payments/                          # ← sub-módulo
    payments.controller.ts
    payments.service.ts
    payments.repository.ts
    payments.schema.ts
    payments.types.ts
    tests/
      payments.service.test.ts
      payments.controller.test.ts
```

**Reglas de sub-módulos:**

- Tienen su propio controller/service/repository/schema como un módulo independiente
- Las rutas del sub-módulo se montan desde el controlador del módulo padre, NO desde `app.ts`
- El sub-módulo importa tipos y schemas del padre cuando necesita validar la relación (ej. `debtId`)

### Registro en app.ts

```
// Módulos públicos (sin auth)
app.use(pingRouter);
app.use(authRouter);

// Módulos protegidos (requieren auth middleware)
app.use('/categories', categoriesRouter);
app.use('/movements', movementsRouter);   // nuevo
```

Los módulos protegidos se registran bajo una ruta base. El middleware `authenticate` se aplica a nivel de router interno (en `<modulo>.routes.ts`) para mantener `app.ts` limpio.

## Orden de Implementación Prioritario

El proyecto tiene módulos pendientes. Construir en este orden:

1. **Movements** — No depende de nada, desbloquea el core de la app
2. **Debts** — Independiente, tabla propia
3. **Debt Payments** — Depende de Debts (sub-módulo)
4. **Couples** — Más complejo (invitaciones, roles), dejar para el final

Ver `README.md` → **Pendientes** para detalles de cada uno.

## Dinero.js

Para montos monetarios usar dinero.js. Ver skills en `.agents/skills/`:

- `dinero-best-practices` — Creación y aritmética
- `dinero-currency-patterns` — Almacenamiento en DB (decimal con 4 decimales) y múltiples monedas
- `dinero-formatting` — Formateo para respuestas JSON

Los montos se almacenan como `DECIMAL(19,4)` en MariaDB y se transforman a Dinero en la capa de servicio. Las respuestas HTTP devuelven el valor como string o número según el caso de uso.
