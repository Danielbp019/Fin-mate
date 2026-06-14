export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

export function formatInterestRate(value: string): string {
  if (!value) return '—';
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return '—';
  return `${num}%`;
}
