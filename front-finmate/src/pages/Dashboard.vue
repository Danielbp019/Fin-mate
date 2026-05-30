<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title class="text-h4">Bienvenido, {{ auth.user?.name }}</v-card-title>

        <v-card-text class="text-body-medium">
          Este es tu panel de control de FinMate. Aquí podrás gestionar tus finanzas personales.
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
</script>
