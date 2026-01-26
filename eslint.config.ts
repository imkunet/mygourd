import {
  eslintConfig,
  eslintConfigBase,
  eslintConfigPerfectionist,
  eslintConfigPrettier,
} from '@hiddenability/opinionated-defaults/eslint';

export default eslintConfig([
  ...eslintConfigBase,
  ...eslintConfigPrettier,
  ...eslintConfigPerfectionist,
  {
    rules: {
      'perfectionist/sort-modules': [
        `warn`,
        {
          partitionByComment: String.raw`^\s?<.*`,
        },
      ],
      'unicorn/no-null': `off`,
      'unicorn/no-process-exit': `off`,
    },
  },
]);
