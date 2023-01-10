module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    jest: true,
    es6: true,
    node: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:cypress/recommended',
  ],
  plugins: ['prettier', 'cypress', 'no-only-tests'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        endOfLine: 'auto',
      },
    ],
    'no-only-tests/no-only-tests': 'error',
  },
  overrides: [
    {
      files: ['cypress/**/*'],
      rules: {
        'jest/valid-expect': 'off',
        'testing-library/await-async-utils': 'off',
      },
    },
    {
      files: ['e2e/**/*'],
      rules: {
        'testing-library/prefer-screen-queries': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    allowImportExportEverywhere: true,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  ignorePatterns: ['*.d.ts'],
};
