# Fin Mate - Finanzas Personales (Frontend)

Aplicación web para administración de finanzas personales, ingresos y gastos, con modo de finanzas de pareja y consejos para administrar deudas.

## Stack Tecnológico

Vue 3, Vite, TypeScript, Vuetify, Pinia, Vue Router, Axios, ESLint, Zod

## Requisitos

- Node.js v18+
- npm

## Instalación

1. Clonar el repositorio
2. `npm install`
3. Iniciar servidor de desarrollo: `npm run dev`

## Variables de Entorno

| Variable            | Descripción          | Default                 |
| ------------------- | -------------------- | ----------------------- |
| `VITE_API_BASE_URL` | URL base del backend | `http://localhost:3000` |

## Comandos Útiles

| Comando              | Descripción                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Inicia servidor de desarrollo con hot-reload |
| `npm run build`      | Compila para producción                      |
| `npm run preview`    | Previsualiza build de producción             |
| `npm run lint`       | Ejecuta ESLint                               |
| `npm run lint:fix`   | Corrige errores de ESLint automáticamente    |
| `npm run type-check` | Verifica tipos de TypeScript                 |

## Estructura del Proyecto

```
src/
  main.ts               Punto de entrada
  App.vue               Componente raíz (inicializa auth store)
  pages/                Vistas de la aplicación (Login, Register, Dashboard)
  layouts/              Layouts compartidos (AuthLayout)
  stores/               Stores de Pinia (auth)
  services/             Servicios (api.ts - Axios)
  plugins/              Configuración de plugins (Vuetify, Router, Pinia)
  router/               Configuración de rutas (Vue Router)
  styles/               Estilos globales y tema
  components/           Componentes reutilizables
public/                 Archivos públicos estáticos
```

## Autenticación

- **Access Token**: JWT de 15 minutos, almacenado solo en memoria (Pinia). Se envía en header `Authorization: Bearer`.
- **Refresh Token**: JWT de 30 días, almacenado en cookie HttpOnly. Se renueva automáticamente.
- **Login/Register**: El backend envía el refresh token como cookie HttpOnly y retorna el access token.
- **Refresh automático**: El interceptor de Axios detecta errores 401 e intenta refrescar el token automáticamente.
- **Logout**: Revoca el refresh token en el backend y limpia el estado en memoria.
- **Persistencia**: No se utiliza localStorage para almacenar tokens.

## Reglas del Proyecto

- Los textos que se muestren al usuario deben estar en idioma español
- Usar el MCP context7 para consultar documentación de librerías
- Cuando se creen end points nuevos actualizar el archivo readme.md
- Evitar complejidad enterprise innecesaria
- Aplicar principios SOLID siempre que sea razonable
- No uses nunca iconos en textos informativos de consola

## Validaciones

Todas las entradas deben validarse usando Zod.

## Seguridad

- Validar toda entrada externa.
- No exponer errores internos en producción.
- Todas las rutas, salvo login, register, landing page y las de recuperación de cuenta, deben estar protegidas para que no puedan verse si el usuario no está autenticado.

## Pendientes

Funcionalidades planificadas para futuras iteraciones:

### Auth

- Cerrar sesi&oacute;n en todos los dispositivos (`logout-all`)
- Pantalla de recuperaci&oacute;n de contrase&ntilde;a (`forgot-password`, `reset-password`)
- Verificaci&oacute;n de email (`verify-email`)

### Dashboard

- Conectar resumen con datos reales (ingresos, gastos, balance del mes actual)
- Gr&aacute;ficos visuales de evoluci&oacute;n mensual

### Categor&iacute;as

- Pantalla de administraci&oacute;n de categor&iacute;as (CRUD): listar, crear, editar, eliminar

### Movimientos

- Pantalla de registro de ingresos/gastos con selecci&oacute;n de categor&iacute;a
- Listado con filtros por tipo, categor&iacute;a y rango de fechas
- Edici&oacute;n y eliminaci&oacute;n de movimientos

### Deudas

- Pantalla de administraci&oacute;n de deudas (CRUD): listar, crear, editar, eliminar
- Detalle de deuda con historial de pagos
- Registro de pagos a deudas

### Modo Pareja

- Pantalla para crear o unirse a un grupo de pareja
- Invitar a la pareja por email
- Metas de pareja: crear, editar, eliminar metas compartidas
- Contribuir a metas de pareja
- Abandonar o disolver el grupo
