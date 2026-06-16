<template>
  <div class="lp-root">
    <h1 class="sr-only">C&oacute;mo funciona FinMate</h1>

    <!-- NAV -->
    <nav aria-label="Navegaci&oacute;n principal" class="lp-nav">
      <router-link
        style="text-decoration: none; color: inherit; cursor: pointer"
        :to="{ name: 'Landing' }"
      >
        <div class="lp-logo">
          <div class="lp-logo-icon">
            <v-icon color="white" size="20">mdi-finance</v-icon>
          </div>
          FinMate
        </div>
      </router-link>

      <div class="lp-nav-actions">
        <button class="btn-ghost" @click="router.push({ name: 'Login' })">
          Iniciar sesi&oacute;n
        </button>

        <button class="btn-primary" @click="router.push({ name: 'Register' })">
          Empezar gratis
        </button>
      </div>
    </nav>

    <!-- HERO -->
    <section
      class="lp-hero"
      style="
        grid-template-columns: 1fr;
        text-align: center;
        min-height: auto;
        padding: 64px 40px 48px;
      "
    >
      <div style="max-width: 640px; margin: 0 auto">
        <div class="lp-badge" style="margin: 0 auto 20px">
          <div class="lp-badge-dot" />
          Transparencia total
        </div>

        <h2
          class="lp-headline"
          style="font-size: 38px; text-align: center; max-width: 600px; margin: 0 auto 16px"
        >
          C&oacute;mo funciona FinMate
        </h2>

        <p
          class="lp-sub"
          style="max-width: 500px; margin: 0 auto; font-size: 17px; font-weight: 300"
        >
          Una herramienta que refleja tus finanzas reales. T&uacute; pones los datos, nosotros te
          mostramos el panorama completo.
        </p>
      </div>
    </section>

    <!-- STEPS -->
    <section aria-labelledby="steps-title" class="lp-features" style="padding-top: 20px">
      <div class="feat-label">Cuatro pasos simples</div>
      <h2 id="steps-title" class="feat-title">As&iacute; <span>funciona</span></h2>

      <div class="feat-grid feat-grid--4">
        <div class="feat-card">
          <div class="feat-icon fi-green">
            <v-icon color="var(--green-deep)" size="22">mdi-swap-horizontal-bold</v-icon>
          </div>

          <div class="feat-name">1. Registra todo</div>

          <div class="feat-desc">
            Cada ingreso y gasto se registra en Movimientos. Clasif&iacute;calo por tipo y
            categor&iacute;a para tener control absoluto.
          </div>
        </div>

        <div class="feat-card">
          <div class="feat-icon fi-gold">
            <v-icon color="var(--gold)" size="22">mdi-credit-card-clock-outline</v-icon>
          </div>

          <div class="feat-name">2. Gestiona tus deudas</div>

          <div class="feat-desc">
            Define tus deudas y registra pagos desde la secci&oacute;n Deudas. Cada pago se refleja
            autom&aacute;ticamente en Movimientos.
          </div>
        </div>

        <div class="feat-card">
          <div class="feat-icon fi-blue">
            <v-icon color="var(--blue-deep)" size="22">mdi-account-heart</v-icon>
          </div>

          <div class="feat-name">3. Activa el modo pareja</div>

          <div class="feat-desc">
            Las metas y aportes se administran desde Pareja. Las contribuciones aparecen en
            Movimientos para una visi&oacute;n global.
          </div>
        </div>

        <div class="feat-card">
          <div class="feat-icon fi-green">
            <v-icon color="var(--green-deep)" size="22">mdi-view-dashboard</v-icon>
          </div>

          <div class="feat-name">4. Unifica en Movimientos</div>

          <div class="feat-desc">
            Ah&iacute; ves todo: gastos personales, pagos de deudas y aportes de pareja. Un solo
            lugar para entender tu panorama financiero completo.
          </div>
        </div>
      </div>
    </section>

    <!-- DISCIPLINE -->
    <section
      aria-labelledby="discipline-title"
      class="lp-strip"
      style="flex-direction: column; text-align: center; gap: 12px"
    >
      <div class="strip-left" style="text-align: center; max-width: 600px; margin: 0 auto">
        <h2
          id="discipline-title"
          style="
            font-family: var(--font-serif);
            font-size: 26px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 12px;
            letter-spacing: -0.3px;
          "
        >
          La clave: tu disciplina
        </h2>

        <p
          style="
            font-size: 16px;
            color: var(--white-65);
            font-weight: 300;
            line-height: 1.7;
            margin-bottom: 0;
          "
        >
          FinMate es un espejo de tus finanzas. La app registra lo que t&uacute; ingresas. Si
          separas tu dinero en la vida real y reflejas cada movimiento con honestidad,
          tendr&aacute;s una visi&oacute;n clara de tu salud financiera. La disciplina es la clave.
        </p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
/** HowItWorks — página explicativa del funcionamiento de la app en 4 pasos. Usado en ruta '/how-it-works' */
import { useRouter } from 'vue-router';
import Footer from '@/components/Footer.vue';
import '@/styles/unauth.css';

const router = useRouter();
</script>
