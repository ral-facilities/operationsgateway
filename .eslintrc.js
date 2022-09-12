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
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:cypress/recommended',
  ],
  plugins: ['prettier', 'cypress'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        endOfLine: 'auto',
      },
    ],
  },
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
