// eslint.config.js
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintJs from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      'eslint.config.js',
      '.prettierrc.json',
    ],
  },

  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },

      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
    rules: {
      // None yet
    },
  }
);
