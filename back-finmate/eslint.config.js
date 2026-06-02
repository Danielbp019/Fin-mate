import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
);
