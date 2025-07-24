export const collect = async <T>(
  iterator: AsyncIterableIterator<T>,
): Promise<T[]> => {
  const result = [];
  for await (const value of iterator) result.push(value);
  return result;
};
