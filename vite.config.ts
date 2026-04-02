import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  pack: {
    entry: [
      'lib/index.ts',
      'lib/events/index.ts',
      'lib/interactions/index.ts',
      'lib/routers/index.ts',
      'lib/utils/index.ts',
    ],
    dts: true,
    format: ['esm', 'cjs'],
    sourcemap: true,
  },
  fmt: {
    arrowParens: 'always',
    bracketSameLine: false,
    bracketSpacing: true,
    jsxSingleQuote: true,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
    sortImports: {
      newlinesBetween: true,
    },
    sortTailwindcss: {
      functions: ['cva', 'clsx', 'cn'],
    },
  },
  lint: {
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    plugins: [
      'typescript',
      'unicorn',
      'oxc',
      'import',
      'react',
      'react-perf',
      'nextjs',
      'promise',
      'node',
      'jsx-a11y',
    ],
    env: {
      es6: true,
      browser: true,
      node: true,
    },
    ignorePatterns: ['**/dist/', '**/node_modules/', '**/.git/'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'typescript/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      'typescript/prefer-nullish-coalescing': 'error',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'typescript/no-unsafe-type-assertion': 'off',
      'eslint-plugin-import/no-named-as-default': 'off',
    },
  },
});
