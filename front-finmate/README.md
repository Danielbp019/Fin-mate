# Fin Mate - Finanzas Personales (Frontend)

Aplicación web para administración de finanzas personales, ingresos y gastos, con modo de finanzas de pareja y consejos para administrar deudas.

## Stack Tecnológico

Vue 3, Vite, TypeScript, Vuetify, Pinia, Vue Router, ESLint, Zod

## Requisitos

- Node.js v18+
- npm

## Instalación

1. Clonar el repositorio
2. `npm install`
3. Iniciar servidor de desarrollo: `npm run dev`

## Variables de Entorno

No requiere variables de entorno para desarrollo. El frontend se conecta al backend en `http://localhost:5173` por defecto.

## Comandos Útiles

| Comando               | Descripción                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Inicia servidor de desarrollo con hot-reload   |
| `npm run build`       | Compila para producción                        |
| `npm run preview`     | Previsualiza build de producción               |
| `npm run lint`        | Ejecuta ESLint                                 |
| `npm run lint:fix`    | Corrige errores de ESLint automáticamente      |
| `npm run type-check`  | Verifica tipos de TypeScript                   |

## Estructura del Proyecto

```
src/
  main.ts             Punto de entrada
  App.vue             Componente raíz
  components/         Componentes reutilizables
  plugins/            Configuración de plugins (Vuetify, Router, Pinia)
  styles/             Estilos globales y tema
public/               Archivos públicos estáticos
```

## Funcionalidades

- ESLint para calidad de código
- Pinia para manejo de estado
- Vue Router para navegación

## Reglas del Proyecto

- Los textos que se muestren al usuario deben estar en idioma español.
- Usar el MCP context7 para consultar documentación de librerías.

## Validaciones

Todas las entradas deben validarse usando Zod.

## Autenticación

- Bearer Token Authentication.
- JWT con expiración mínima de 2 horas.

## Seguridad

- Validar toda entrada externa.
- No exponer errores internos en producción.

## Pendientes

Funcionalidades planificadas para futuras iteraciones:

- Pantalla de registro de gastos/ingresos
- Dashboard con gráficos
- Modo finanzas de pareja
- Consejos para administrar deudas
