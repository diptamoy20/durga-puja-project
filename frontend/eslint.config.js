import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'eslint.config.js'] },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      // Vite's fast refresh only works if a module's exports are all
      // components; `allowConstantExport` permits the `const` alongside them.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // `any` defeats the point of the strong typing this project asks for.
      '@typescript-eslint/no-explicit-any': 'error',

      // An unused parameter is often deliberate (a destructured field being
      // dropped), so allow it when marked with a leading underscore.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },
);
