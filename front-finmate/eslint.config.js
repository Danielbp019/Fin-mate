import prettier from 'eslint-config-prettier';
import vuetify from 'eslint-config-vuetify';

const config = await vuetify({ ts: true });

export default [
  { ignores: ['dist/', 'node_modules/'] },
  ...config,
  prettier,
  {
    rules: {
      'vue/custom-event-name-casing': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-imports': 'off',
      'import/first': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
