// eslint.config.js
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintJs from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'functions/node_modules/',
      'build/',
      'public/js/',
      'functions/lib/',
      'dist/',

      // Firebase specific - pretty sure this is not linted, but will add just in case
      '.firebase/',

      '.cache/',
      '*.cache',
      '*.log',
      'coverage/',
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
