import type Module from 'node:module';

import { Glob } from 'bun';
import path from 'node:path';

import { collect } from '@/utils';

/**
 * Finds, imports, and casts modules to T by glob
 * @param pattern The pattern to glob on
 * @param baseDir The base directory to search from
 * @returns List of resolved modules and their paths
 */
export const glob = async <T extends Module>(
  pattern: string,
  baseDir?: string,
): Promise<{ module: T; path: string }[]> => {
  const dir = baseDir ?? process.cwd();
  const scanned = await collect(new Glob(pattern).scan(path.join(dir)));
  const resolved = await Promise.all(
    scanned.map((v) => import(path.resolve(dir, v)) as Promise<T>),
  );
  return resolved.map((v, i) => ({ module: v, path: scanned[i]! }));
};
