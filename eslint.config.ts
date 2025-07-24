import {
  eslintConfig,
  eslintConfigBase,
  eslintConfigPerfectionist,
  eslintConfigPrettier,
  eslintConfigTypescript,
} from '@hiddenability/opinionated-defaults/eslint';

export default eslintConfig([
  ...eslintConfigBase,
  ...eslintConfigTypescript,
  ...eslintConfigPrettier,
  ...eslintConfigPerfectionist,
  {
    rules: {
      'perfectionist/sort-modules': [
        `warn`,
        {
          partitionByComment: `^\\s?<.*`,
        },
      ],
      'unicorn/no-null': `off`,
      'unicorn/no-process-exit': `off`,
    },
  },
]);
