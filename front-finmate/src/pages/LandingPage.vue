<template>
  <v-container class="fill-height d-flex justify-center align-center text-center">
    <div>
      <v-icon size="72" color="primary" class="mb-4">mdi-finance</v-icon>
      <h1 class="text-h3 font-weight-bold mb-2">FinMate</h1>
      <p class="text-body-1 text-medium-emphasis mb-8">
        Tu asistente financiero personal
      </p>
      <div class="d-flex justify-center ga-4 flex-wrap">
        <v-btn
          color="primary"
          size="x-large"
          :to="{ name: 'Login' }"
          variant="elevated"
        >
          Iniciar Sesión
        </v-btn>
        <v-btn
          color="secondary"
          size="x-large"
          :to="{ name: 'Register' }"
          variant="outlined"
        >
          Registrarse
        </v-btn>
      </div>
    </div>
  </v-container>
</template>
