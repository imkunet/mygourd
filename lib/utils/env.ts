import { configure, type } from 'arktype';
import consola from 'consola';

configure({ onUndeclaredKey: `delete` });

/**
 * Safely retrieve and validate the environment based on the passed
 * in object-based Arktype schema definition, or exits and logs if
 * there is a failure in doing so
 * @param def An Arktype object schema definition
 * @returns The validated environment variables
 */
export const useEnv = <
  const def extends object,
  inferOut = type.infer.Out<def>,
  output = inferOut extends object ? inferOut : never,
>(
  def: type.validate<def>,
): output => {
  const r = type(def)(process.env);
  if (!(r instanceof type.errors)) return r as output;

  Object.entries(r.byPath).forEach(([k, v]) =>
    consola.error(`Environment variable '${k}' ${v.problem}`),
  );

  process.exit(1);
};
