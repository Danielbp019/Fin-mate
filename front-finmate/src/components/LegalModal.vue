<template>
  <v-dialog
    max-width="640"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card theme="light">
      <v-card-title class="text-h5 pa-4">{{
        title || (type === 'privacy' ? 'Privacidad' : 'Términos de uso')
      }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-6 text-body-medium" style="line-height: 1.7">
        <template v-if="type === 'privacy'">
          <p class="mb-3">
            En FinMate nos tomamos tu privacidad en serio. Esta política describe cómo recopilamos,
            usamos y protegemos tu información personal.
          </p>
          <p class="mb-3">
            <strong>Datos que recopilamos:</strong> nombre, correo electrónico, información
            financiera que registres voluntariamente (ingresos, gastos, deudas).
          </p>
          <p class="mb-3">
            <strong>Uso de la información:</strong> tus datos se usan exclusivamente para proveer el
            servicio de administración financiera, generar reportes y sugerencias personalizadas.
          </p>
          <p class="mb-3">
            <strong>Cookies:</strong> utilizamos cookies esenciales para mantener tu sesión activa.
            No usamos cookies de rastreo ni publicitarias.
          </p>
          <p class="mb-3">
            <strong>Protección:</strong> tus datos se almacenan de forma segura con encriptación en
            reposo y en tránsito. Nunca compartimos tu información con terceros.
          </p>
          <p>
            <strong>Tus derechos:</strong> puedes solicitar la eliminación de tus datos en cualquier
            momento escribiéndonos a soporte@finmate.app.
          </p>
        </template>
        <template v-else>
          <p class="mb-3">
            Al crear una cuenta en FinMate aceptas los siguientes términos y condiciones de uso.
          </p>
          <p class="mb-3">
            <strong>Uso del servicio:</strong> FinMate es una herramienta de administración
            financiera personal. No brindamos asesoría financiera profesional ni garantizamos
            resultados específicos.
          </p>
          <p class="mb-3">
            <strong>Cuenta:</strong> eres responsable de mantener la confidencialidad de tu
            contraseña y de toda actividad en tu cuenta.
          </p>
          <p class="mb-3">
            <strong>Limitación de responsabilidad:</strong> FinMate no se hace responsable por
            decisiones financieras tomadas basadas en la información proporcionada por la
            aplicación.
          </p>
          <p class="mb-3">
            <strong>Modificaciones:</strong> nos reservamos el derecho de actualizar estos términos.
            Notificaremos cambios significativos por correo electrónico.
          </p>
          <p>
            <strong>Vigencia:</strong> estos términos están vigentes a partir del 1 de enero de
            2026.
          </p>
        </template>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: boolean;
  type: 'privacy' | 'terms';
  title?: string;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
