import { $ } from 'bun';
import consola from 'consola';
import { colorize } from 'consola/utils';

performance.mark(`build_start`);

await $`rm -rf dist/`;
await Promise.all([
  $`bunx esbuild 'lib/**/index.ts' --format=esm --platform=node --packages=external --outdir=dist --bundle --splitting`,
  $`bunx tsc --project lib/tsconfig.json --emitDeclarationOnly`,
]);

performance.mark(`build_end`);

consola.success(
  `built in`,
  colorize(
    `bold`,
    `${performance.measure(`build`, `build_start`, `build_end`).duration.toFixed(2)}ms`,
  ) + `.`,
);
