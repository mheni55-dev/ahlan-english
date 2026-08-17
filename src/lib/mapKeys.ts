type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${SnakeToCamel<Capitalize<U>>}`
  : S;

export type SnakeToCamelCase<T> = {
  [K in keyof T as SnakeToCamel<string & K>]: T[K];
};

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function mapKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toCamelCase(key)] = value;
  }
  return result;
}

export function mapRows<T extends Record<string, unknown>>(rows: T[]): Record<string, unknown>[] {
  return rows.map(mapKeys);
}

export function mapRow<T extends Record<string, unknown>>(row: T | null): Record<string, unknown> | null {
  return row ? mapKeys(row) : null;
}
