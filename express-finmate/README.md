# Fin Mate - Finanzas Personales

Administrador de finanzas personales, ingresos y gastos, con modo de finanzas de pareja y consejos para administrar deudas.

## Stack Tecnológico

Node.js, Express 5, TypeScript, MariaDB, Drizzle ORM, Zod, JWT, bcrypt, dinero.js

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

- **Servidor**: `PORT`, `NODE_ENV`
- **Base de Datos**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`
- **Rate Limiting**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS`

## Comandos Útiles

| Comando               | Descripción                                        |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Inicia servidor con hot-reload (tsx watch)         |
| `npm run build`       | Compila TypeScript a JS                            |
| `npm run start`       | Ejecuta compilado en producción                    |
| `npm run db:generate` | Genera migraciones desde el schema                 |
| `npm run db:migrate`  | Aplica migraciones pendientes a MariaDB            |
| `npm run db:seed`     | Inserta datos de prueba (2 usuarios, 4 categorías) |

## Endpoints Activos

### Auth

| Método | Ruta             | Body / Headers                  | Respuesta                      |
| ------ | ---------------- | ------------------------------- | ------------------------------ |
| POST   | `/auth/register` | `{ name, email, password }`     | 201 `{ message, token, user }` |
| POST   | `/auth/login`    | `{ email, password }`           | 200 `{ message, token, user }` |
| POST   | `/auth/logout`   | `Authorization: Bearer <token>` | 200 `{ message }`              |

### Health

| Método | Ruta    | Respuesta                             |
| ------ | ------- | ------------------------------------- |
| GET    | `/`     | `¡Hola Mundo!`                        |
| GET    | `/ping` | 200 `{ status, httpCode, timestamp }` |

## Arquitectura

Modular Monolith con flujo `route → controller → service → repository → database`. Cada módulo es independiente dentro de `src/modules/<modulo>/` con sus propios archivos de rutas, controlador, servicio, repositorio, schema de validación y tipos.

## Pendientes

Funcionalidades planificadas para futuras iteraciones:

- Cambio de contraseña
- Recuperación de contraseña
- Verificación de email
- Limpieza automática de token_blacklist (tokens expirados)
