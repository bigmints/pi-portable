const nextConfig = require('eslint-config-next');

module.exports = [
  {
    ignores: ['.next/', 'node_modules/', 'dist/', '.next/types/', 'public/'],
  },
  ...nextConfig,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
