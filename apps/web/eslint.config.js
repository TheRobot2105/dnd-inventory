// apps/web local ESLint flat config: extends the root config and adds
// React-hooks rules. Keeps the React-specific deps out of the root.
import rootConfig from '../../eslint.config.js';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    // Config and build artefacts are not part of the typed program.
    ignores: [
      'dist/**',
      'eslint.config.js',
      'vite.config.ts',
      'vitest.config.ts',
      'postcss.config.js',
      'tailwind.config.ts',
    ],
  },
  ...rootConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // shadcn/ui primitives are copy-pasted and not hand-edited per CLAUDE.md.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
