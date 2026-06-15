<template>
  <footer class="lp-footer">
    <div class="footer-logo">
      FinMate — una aplicaci&oacute;n de
      <img alt="firma" class="footer-signature" :src="firmaNegra" />
    </div>

    <div class="footer-right">
      <div class="footer-links">
        <button type="button" @click="showPrivacy = true">Privacidad</button>
        <button type="button" @click="showTerms = true">T&eacute;rminos</button>
      </div>

      <div style="font-size: 13px; color: var(--ink-soft); opacity: 0.87">
        &copy; 2026-{{ currentYear }} FinMate
      </div>
    </div>

    <LegalModal v-model="showPrivacy" type="privacy" />
    <LegalModal v-model="showTerms" type="terms" />
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import firmaNegra from '@/assets/daniel_firma_black.svg';
import LegalModal from '@/components/LegalModal.vue';

const currentYear = new Date().getFullYear();
const showPrivacy = ref(false);
const showTerms = ref(false);
</script>
