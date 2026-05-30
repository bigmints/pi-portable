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
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
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
