import type { Directive } from 'vue';

export const vCapitalizeFirst: Directive<HTMLElement> = {
  mounted(el) {
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    if (!input) return;

    input.addEventListener('input', () => {
      if (!input.value || input.value[0] === input.value[0].toUpperCase()) return;

      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.charAt(0).toUpperCase() + input.value.slice(1);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      requestAnimationFrame(() => input.setSelectionRange(start, end));
    });
  },
};
