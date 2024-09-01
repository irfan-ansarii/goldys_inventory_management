import { z } from "zod";
import { eq, or, ilike, desc, getTableColumns, count } from "drizzle-orm";
import { db, findFirst } from "../db";

import { storeCreateSchema, stores } from "../schemas";
import { PAGE_LIMIT } from "@/app/api/utils";
export async function createStore(values: z.infer<typeof storeCreateSchema>) {
  return await db
    .insert(stores)
    .values({ ...values })
    .returning()
    .then(findFirst);
}

export async function getStore(id: any) {
  return await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .then(findFirst);
}

export async function getStores(params?: Record<string, any>) {
  const { q, page = 1, limit = PAGE_LIMIT } = params || {};
  const filters = q
    ? or(
        ilike(stores.name, `%${q}%`),
        ilike(stores.phone, `%${q}%`),
        ilike(stores.email, `%${q}%`),
        ilike(stores.notes, `%${q}%`)
      )
    : undefined;

  const results = await db
    .select()
    .from(stores)
    .where(filters)
    .orderBy(desc(stores.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(stores) })
    .from(stores)
    .where(filters)
    .then(findFirst);

  return {
    data: results,
    meta: {
      page: parseInt(page),
      size: limit,
      pages: Math.ceil(records.total / limit),
      ...records,
    },
  };
}

export async function updateStore(
  id: any,
  values: z.infer<typeof storeCreateSchema>
) {
  return await db
    .update(stores)
    .set(values)
    .where(eq(stores.id, id))
    .returning()
    .then(findFirst);
}

export async function deleteStore(id: any) {
  return await db
    .delete(stores)
    .where(eq(stores.id, id))
    .returning()
    .then(findFirst);
}
