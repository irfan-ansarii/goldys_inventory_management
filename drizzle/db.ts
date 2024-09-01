import * as schema from "./schemas/";

import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const db = drizzle(sql, { schema });

export const findFirst = <T>(values: T[]): T => {
  return values[0]!;
};

export async function errorHandler<T>(fn: () => Promise<T>) {
  const fnReturn = fn();
  return await Promise.resolve(fnReturn).catch((err) => {
    return { code: err.code, message: err.message };
  });
}
