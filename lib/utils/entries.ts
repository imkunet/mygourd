type NotSymbol<T> = Exclude<T, symbol>;

/**
 * Assertive wrapper over Object.entries, which also handles Partial.
 * It also attempts to strip any sort of brands that use symbol keys.
 * @param o object
 * @returns entries
 */
export const entries = <T extends Record<string, unknown>>(o: T) =>
  Object.entries(o).filter(
    ([k, v]) => typeof k !== `symbol` && v !== undefined,
  ) as {
    [K in keyof T]-?: [NotSymbol<K>, Exclude<T[K], undefined>];
  }[NotSymbol<keyof T>][];
