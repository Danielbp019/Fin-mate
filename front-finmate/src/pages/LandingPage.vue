<template>
  <h2 class="sr-only">FinMate — Tu asistente financiero personal. Controla ingresos, gastos y deudas.</h2>

  <div class="lp-root">

    <!-- NAV -->
    <nav class="lp-nav">
      <div class="lp-logo">
        <div class="lp-logo-icon">
          <svg fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 2.5C10 2.5 5 5 5 10.5C5 13.5 7.2 16 10 16C12.8 16 15 13.5 15 10.5C15 5 10 2.5 10 2.5Z"
              fill="rgba(255,255,255,0.3)"
            />
            <path d="M10 5C10 5 7 7 7 10.5C7 12.4 8.3 14 10 14C11.7 14 13 12.4 13 10.5C13 7 10 5 10 5Z" fill="white" />
          </svg>
        </div>
        FinMate
      </div>
      <div class="lp-nav-actions">
        <button class="btn-ghost">¿Cómo funciona?</button>
        <button class="btn-ghost" @click="router.push({ name: 'Login' })">Iniciar sesión</button>
        <button class="btn-primary" @click="router.push({ name: 'Register' })">Empezar gratis</button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="lp-hero">
      <div class="lp-hero-left">
        <div class="lp-badge">
          <div class="lp-badge-dot" />
          Modo pareja disponible
        </div>

        <h1 class="lp-headline">
          Tu dinero,<br>
          bajo <em>control</em><br>
          por fin.
        </h1>

        <p class="lp-sub">
          Registra ingresos y gastos, gestiona deudas con estrategia y sincroniza finanzas con tu pareja. Todo en un
          solo lugar.
        </p>

        <div class="lp-cta-row">
          <button class="btn-cta" @click="router.push({ name: 'Register' })">
            <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
              <path
                d="M13 10V3L4 14h7v7l9-11h-7z"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            Comenzar gratis
          </button>
          <button class="btn-outline" @click="router.push({ name: 'Login' })">Iniciar sesión</button>
        </div>

        <div class="lp-trust">
          <div class="lp-trust-dots">
            <div class="lp-trust-dot" style="background:#1D9E75">A</div>
            <div class="lp-trust-dot" style="background:#185FA5;margin-left:-6px">M</div>
            <div class="lp-trust-dot" style="background:#BA7517;margin-left:-6px">R</div>
          </div>
          +2,400 usuarios administrando sus finanzas hoy
        </div>
      </div>

      <div class="lp-hero-right">
        <div class="hero-bg-circle" />

        <div class="hero-card-stack">
          <div class="hero-card hc-back1">
            <div style="height:12px; background:#e8f0e8; border-radius:4px; margin-bottom:8px; width:60%" />
            <div style="height:24px; background:#e8f0e8; border-radius:4px; width:80%" />
          </div>

          <div class="hero-card hc-main">
            <div class="hc-chip">
              <svg height="8" viewBox="0 0 8 8" width="8">
                <circle cx="4" cy="4" fill="#1D9E75" r="4" />
              </svg>
              Resumen de julio
            </div>

            <div class="hc-amount">$4,820</div>
            <div class="hc-label">Balance disponible este mes</div>

            <div class="hc-bar-label">
              <span>Gastos vs presupuesto</span>
              <span style="color:var(--green-deep);font-weight:500">68%</span>
            </div>
            <div class="hc-bar-track">
              <div class="hc-bar-fill" style="width:68%" />
            </div>

            <div class="hc-divider" />

            <div class="hc-mini-stat" style="margin-bottom:8px">
              <div>
                <div style="font-size:10px;color:var(--ink-soft);margin-bottom:2px">Ingresos</div>
                <div class="hc-stat-num">$7,200</div>
              </div>
              <div class="hc-mini-pill pill-green">↑ 12%</div>
            </div>

            <div class="hc-mini-stat" style="margin-bottom:8px">
              <div>
                <div style="font-size:10px;color:var(--ink-soft);margin-bottom:2px">Gastos</div>
                <div class="hc-stat-num">$2,380</div>
              </div>
              <div class="hc-mini-pill pill-gold">→ estable</div>
            </div>

            <div class="hc-mini-stat">
              <div>
                <div style="font-size:10px;color:var(--ink-soft);margin-bottom:2px">Deuda activa</div>
                <div class="hc-stat-num">$1,450</div>
              </div>
              <div class="hc-mini-pill pill-blue">En plan</div>
            </div>
          </div>

          <div class="fb fb2">
            <div class="fb-icon fi-gold">💰</div>
            <div>
              <div style="font-size:9px;color:var(--ink-soft)">Ahorro del mes</div>
              <div style="font-size:13px;font-weight:600;color:var(--gold);font-family:'Playfair Display',serif">+$820
              </div>
            </div>
          </div>

          <div class="fb fb1">
            <div class="fb-icon fi-blue">👫</div>
            <div>
              <div style="font-size:9px;color:var(--ink-soft)">Modo pareja</div>
              <div style="font-size:11px;font-weight:500;color:var(--blue-deep)">Sincronizado</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <div class="lp-stats">
      <div class="stat-item">
        <div class="stat-num">94%</div>
        <div class="stat-desc">de usuarios redujo gastos en 3 meses</div>
      </div>
      <div class="stat-item">
        <div class="stat-num stat-gold">$1.2M</div>
        <div class="stat-desc">en deudas gestionadas este año</div>
      </div>
      <div class="stat-item">
        <div class="stat-num stat-blue">2,400+</div>
        <div class="stat-desc">personas tomando control de su dinero</div>
      </div>
    </div>

    <!-- FEATURES -->
    <section class="lp-features">
      <div class="feat-label">Todo lo que necesitas</div>
      <h2 class="feat-title">Finanzas que <span>trabajan</span> para ti</h2>

      <div class="feat-grid">
        <div class="feat-card">
          <div class="feat-icon fi-green">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
                stroke="#0F6E56"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="feat-name">Control de ingresos y gastos</div>
          <div class="feat-desc">Registra cada movimiento y visualiza a dónde va tu dinero con claridad absoluta.</div>
        </div>

        <div class="feat-card">
          <div class="feat-icon fi-blue">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="#185FA5"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="feat-name">Modo pareja</div>
          <div class="feat-desc">Sincroniza las finanzas con tu pareja, define responsabilidades y alcancen metas
            juntos.</div>
        </div>

        <div class="feat-card">
          <div class="feat-icon fi-gold">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path
                d="M22 12h-4l-3 9L9 3l-3 9H2"
                stroke="#BA7517"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="feat-name">Gestión de deudas</div>
          <div class="feat-desc">Estrategias probadas como bola de nieve o avalancha para liquidar deudas más rápido.
          </div>
        </div>
      </div>
    </section>

    <!-- CTA STRIP -->
    <div class="lp-strip">
      <div class="strip-left">
        <h2>¿Listo para tomar el control?</h2>
        <p>Empieza hoy, es completamente gratuito.</p>
      </div>
      <div class="strip-right">
        <button class="btn-ghost-white">Ver demo</button>
        <button class="btn-white" @click="router.push({ name: 'Register' })">Crear cuenta gratis</button>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="lp-footer">
      <div class="footer-logo">FinMate</div>
      <div class="footer-links">
        <a href="#">Privacidad</a>
        <a href="#">Términos</a>
        <a href="#">Soporte</a>
      </div>
      <div style="font-size:11px;color:var(--ink-soft);opacity:0.6">© 2026 FinMate</div>
    </footer>

  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import '@/styles/landing-page.css'

  const router = useRouter()
</script>
