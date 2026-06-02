<template>
  <div class="dashboard-container">
    <div class="dashboard-greeting">
      <h1>Bienvenido, {{ auth.user?.name }}</h1>
      <p>Este es tu panel de control financiero</p>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-card-header">
          <span class="summary-card-label">Ingresos</span>
          <div class="summary-card-icon sc-icon-green">
            <v-icon color="#0F6E56" size="18">mdi-trending-up</v-icon>
          </div>
        </div>
        <div class="summary-card-value">$7,200</div>
        <div class="summary-card-change change-positive">↑ 12% vs mes anterior</div>
      </div>

      <div class="summary-card">
        <div class="summary-card-header">
          <span class="summary-card-label">Gastos</span>
          <div class="summary-card-icon sc-icon-gold">
            <v-icon color="#BA7517" size="18">mdi-trending-down</v-icon>
          </div>
        </div>
        <div class="summary-card-value">$2,380</div>
        <div class="summary-card-change change-neutral">→ estable</div>
      </div>

      <div class="summary-card">
        <div class="summary-card-header">
          <span class="summary-card-label">Balance</span>
          <div class="summary-card-icon sc-icon-blue">
            <v-icon color="#185FA5" size="18">mdi-wallet</v-icon>
          </div>
        </div>
        <div class="summary-card-value">$4,820</div>
        <div class="summary-card-change change-positive">↑ disponible</div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="content-card">
        <h3 class="content-card-title">Últimos movimientos</h3>
        <p>Aún no hay movimientos registrados. Comienza agregando tus ingresos y gastos.</p>
      </div>

      <div class="content-card">
        <h3 class="content-card-title">Deudas activas</h3>
        <p>No tienes deudas registradas.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import '@/styles/theme.css';

const auth = useAuthStore();
</script>
