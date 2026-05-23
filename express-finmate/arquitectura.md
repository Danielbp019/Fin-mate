# Reglas del Proyecto - Finanzas Personales Backend

## Arquitectura

- El proyecto seguirá arquitectura Modular Monolith.
- La organización será feature-based / module-based.
- Cada módulo debe ser independiente.
- No separar globalmente controllers/services/models.
- Si necesitas documentacion usa el MCP context7.
- Los textos que se muestren al usuario, deben estar en idioma español.
- En .agents hay reglas y skills para trabajar con la dependencia dinero.js

---

## Estructura Base

src/
modules/
auth/
users/
transactions/
categories/

shared/
database/
middlewares/
errors/
utils/
validators/

config/

app.ts
server.ts

---

## Estructura de Módulos

Ejemplo:

modules/auth/

auth.controller.ts
auth.service.ts
auth.repository.ts
auth.routes.ts
auth.schema.ts
auth.types.ts

---

## Flujo Backend

Siempre seguir:

route -> controller -> service -> repository -> database

### Responsabilidades

### Routes

- Definir endpoints.
- Aplicar middlewares.
- No contener lógica.

### Controllers

- Manejar request/response.
- Validar datos recibidos.
- Llamar services.
- No contener lógica de negocio compleja.

### Services

- Contener lógica de negocio.
- Aplicar reglas del sistema.
- Coordinar repositories.

### Repositories

- Manejar acceso a base de datos.
- Ejecutar queries.
- No contener lógica de negocio.

---

## Stack Tecnológico

- Node.js
- Express.js
- TypeScript
- MariaDB
- Drizzle ORM
- Zod
- JWT
- bcrypt
- helmet
- express-rate-limit
- dinero.js

---

## Variables de Entorno

### Regla obligatoria

Nunca hardcodear:

- secretos
- credenciales
- tokens
- urls
- puertos
- configuraciones sensibles

Todo debe ir en `.env`.

Ejemplo:

PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=

---

## Configuración de Entorno

- Usar `.env` en desarrollo.
- Crear `.env.example`.
- Nunca subir `.env` real.

---

## Validaciones

Todas las entradas deben validarse usando Zod.

### Reglas

- Nunca confiar en req.body.
- Validar:
  - body
  - params
  - query
- Los schemas deben vivir dentro del módulo correspondiente.

---

## Base de Datos

### Reglas

- La base de datos ya existe previamente.
- Usar MariaDB.
- Usar Drizzle ORM.
- Entender el SQL generado.
- Evitar ocultar demasiado la lógica SQL.

### Convenciones

- tablas en plural
- snake_case en DB
- nombres descriptivos
- timestamps obligatorios cuando aplique

---

## Autenticación

### Estrategia

- Bearer Token Authentication.
- JWT con expiración mínima de 2 horas.
- Passwords hasheados usando bcrypt.
- Nunca guardar passwords en texto plano.

### Logout

Debe existir tabla de token_blacklist para:

- invalidar tokens
- permitir cierre de sesión
- bloquear tokens comprometidos

---

## Seguridad

- Validar toda entrada externa.
- Sanitizar datos cuando sea necesario.
- No exponer errores internos en producción.
- Limitar información sensible en respuestas.

---

## Principios SOLID

Aplicar principios SOLID siempre que sea razonable.

Especialmente:

- Single Responsibility Principle
- Dependency Inversion Principle
- Open/Closed Principle

Evitar sobreingeniería innecesaria.

---

## Manejo de Errores

### Regla

No abusar de try/catch por bloques pequeños.

### Problema de muchos try/catch

Tener try/catch en cada bloque:

- ensucia el código
- duplica lógica
- dificulta mantenimiento
- rompe legibilidad

### Estrategia recomendada

Usar:

- error middleware global
- custom errors
- try/catch solo en capas necesarias

### Uso correcto

Controllers:

- pueden usar try/catch para pasar errores a next()

Services:

- usar try/catch únicamente cuando:
  - se necesite transformar errores
  - agregar contexto
  - manejar lógica específica

Repositories:

- pueden capturar errores SQL específicos.

### Objetivo

Centralizar manejo de errores sin perder trazabilidad.

---

## Testing

Agregar testing desde etapas tempranas.

### Herramientas

- Vitest
- Supertest

### Uso

Vitest:

- unit testing
- services
- utils
- lógica de negocio

Supertest:

- testing de endpoints HTTP
- testing de auth
- testing de middlewares

### Objetivo

- evitar regresiones
- validar lógica crítica
- probar autenticación
- probar validaciones

---

## Código

### Reglas generales

- Priorizar claridad.
- Evitar magia innecesaria.
- Evitar abstracciones prematuras.
- Evitar complejidad enterprise innecesaria.

### Principios

- funciones pequeñas
- módulos pequeños
- nombres claros
- responsabilidad única
- código explícito
- evitar duplicación innecesaria

---

## Objetivo del Proyecto

El proyecto debe priorizar:

- claridad
- mantenibilidad
- backend entendible
- aprendizaje real
- arquitectura limpia
- escalabilidad razonable

No priorizar complejidad innecesaria.
