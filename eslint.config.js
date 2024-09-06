import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import prettierPlugin from 'eslint-config-prettier';
import cypressPlugin from 'eslint-plugin-cypress/flat';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactTestingLibraryPlugin from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2015,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: reactPlugin,
      // eslint-plugin-react-hooks doesn't support flat config properly yet
      // https://github.com/facebook/react/issues/28313
      'react-hooks': fixupPluginRules(reactHooksPlugin),
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      cypressPlugin.configs.recommended,
      // See https://github.com/prettier/eslint-config-prettier put last
      prettierPlugin,
    ],
    rules: {
      // Emulate typescript style for unused variables, see
      // https://typescript-eslint.io/rules/no-unused-vars/
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
  // eslint-plugin-testing-library doesn't support flat config properly yet
  // https://github.com/testing-library/eslint-plugin-testing-library/issues/899
  {
    files: ['**/?*test.{js,ts,jsx,tsx}'],
    plugins: {
      'testing-library': fixupPluginRules({
        rules: reactTestingLibraryPlugin.rules,
      }),
    },
    rules: reactTestingLibraryPlugin.configs.react.rules,
  }
);
