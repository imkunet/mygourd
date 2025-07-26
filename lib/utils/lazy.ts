export type Lazy<LazyValue, FetcherArgs extends unknown[] = []> = (
  ...args: FetcherArgs
) => Promise<LazyValue>;

/**
 * Create a lazy value fetcher
 * @param fetcher Fetcher function with args
 * @returns Lazy value fetcher
 */
export const lazy = <LazyValue, FetcherArgs extends unknown[] = []>(
  fetcher: (...args: FetcherArgs) => Promise<LazyValue>,
): Lazy<LazyValue, FetcherArgs> => {
  let resolved = false,
    resolvedValue: LazyValue | undefined;
  return async (...a: FetcherArgs) =>
    resolved ?
      resolvedValue!
    : ((resolved = true), (resolvedValue = await fetcher(...a)));
};
