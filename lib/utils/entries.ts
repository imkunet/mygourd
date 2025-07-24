/**
 * Assertive wrapper over Object.entries, which also handles Partial
 * @param o object
 * @returns entries
 */
export const entries = <T extends Record<string, unknown>>(o: T) =>
  Object.entries(o).filter(([_, v]) => v !== undefined) as {
    [K in keyof T]-?: [K, Exclude<T[K], undefined>];
  }[keyof T][];
