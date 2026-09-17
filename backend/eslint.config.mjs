import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'eslint.config.mjs'],
  },

  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-empty-function': ['error', { allow: ['constructors'] }],
      'no-console': 'warn',
    },
  },

  {
    files: ['database/prisma/seed.js'],
    rules: { 'no-console': 'off' },
  },
];
