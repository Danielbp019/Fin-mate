// Capitaliza la primera letra de un texto. Usada en transform de Zod y directiva v-capitalize-first.
export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Formatea un valor numérico como moneda COP (ej: "3200000" → "$3.200.000"). Solo para display en tablas/tarjetas.
export function formatCurrency(value: string): string {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Formatea una tasa de interés agregando '%' (ej: "3.5" → "3.5%"). Solo para display.
export function formatInterestRate(value: string): string {
  if (!value) return '—';
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return '—';
  return `${num}%`;
}

// Formatea un string numérico con separadores de miles según locale (ej: "3200000" → "3.200.000"). Usada internamente por AmountInput.
export function formatNumber(value: string, locale = 'es-CO'): string {
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) return '';
  return new Intl.NumberFormat(locale).format(num);
}

// Elimina todo excepto dígitos. Convierte "3.200.000" → "3200000". Usada internamente por AmountInput.
export function stripFormatting(value: string): string {
  return value.replace(/[^\d]/g, '');
}
