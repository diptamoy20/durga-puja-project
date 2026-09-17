import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'eslint.config.js', '**/*.d.ts'],
  },

  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },

    rules: {
      // `any` defeats the point of converting the old JavaScript at all.
      '@typescript-eslint/no-explicit-any': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Deliberately off, unlike the frontend. NestJS resolves constructor
      // dependencies from the metadata `emitDecoratorMetadata` writes, and a
      // `import type` is erased before that metadata is produced — so
      // rewriting `import { PrismaService }` to a type import compiles fine
      // and then fails at runtime with an unresolvable dependency.
      '@typescript-eslint/consistent-type-imports': 'off',

      // Providers and controllers legitimately have empty constructors.
      '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],

      // Bootstrap failures are reported before the logger exists, so the few
      // intentional uses carry an inline disable.
      'no-console': 'warn',
    },
  },

  {
    // The seed script is run directly by ts-node and reports its progress.
    files: ['database/prisma/seed.ts'],
    rules: { 'no-console': 'off' },
  },
);
