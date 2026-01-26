/**
 * Create a lazy value fetcher
 * @param fetcher Fetcher function with args
 * @returns Lazy value fetcher
 */
export const lazy = <LazyValue, FetcherArgs extends unknown[] = []>(
  fetcher: (..._args: FetcherArgs) => Promise<LazyValue>,
) => {
  let promise: Promise<LazyValue> | undefined;
  return (...args: FetcherArgs) => promise ?? (promise = fetcher(...args));
};
