import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** Flat config. eslint-config-next v16 already ships flat arrays, so no FlatCompat shim. */
const config = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // The brief bans `any` outright — every API shape is typed in src/types.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
