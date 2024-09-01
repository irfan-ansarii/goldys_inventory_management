import { z } from "zod";
import {
  eq,
  or,
  and,
  ilike,
  desc,
  inArray,
  getTableColumns,
  count,
  countDistinct,
} from "drizzle-orm";
import { db, findFirst } from "../db";
import { users, userCreateSchema } from "../schemas/users";
import { stores } from "../schemas";
import { PAGE_LIMIT } from "@/app/api/utils";

interface User extends Omit<z.infer<typeof userCreateSchema>, "address"> {
  address: any;
}

export async function createUser(values: User) {
  return await db
    .insert(users)
    .values({ ...values })
    .returning()
    .then(findFirst);
}

export async function getUser(id: any, params?: Record<string, any>) {
  const { phone, email } = params || {};
  return await db
    .select()
    .from(users)
    .where(
      or(
        id ? eq(users.id, id) : undefined,
        email ? eq(users.email, email) : undefined,
        phone ? eq(users.phone, phone) : undefined
      )
    )
    .then(findFirst);
}

export async function getUsers(params: Record<string, any>) {
  const { storeId, ids, roles, q, page = 1, limit = PAGE_LIMIT } = params;

  const filters = and(
    storeId ? eq(users.storeId, storeId) : undefined,
    roles && roles.length > 0 ? inArray(users.role, roles) : undefined,
    ids ? inArray(users.id, ids) : undefined,
    q
      ? or(
          ilike(users.name, `%${q}%`),
          ilike(users.email, `%${q}%`),
          ilike(users.role, `%${q}%`)
        )
      : undefined
  );

  const results = await db
    .select()
    .from(users)
    .where(filters)
    .groupBy(users.id)
    .orderBy(desc(users.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(users) })
    .from(users)
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

export const updateUser = async (id: any, params: Record<string, any>) => {
  return await db
    .update(users)
    .set(params)
    .where(eq(users.id, id))
    .returning()
    .then(findFirst);
};

export const deleteUser = async (id: any) => {
  return await db
    .delete(users)
    .where(eq(users.id, id))
    .returning()
    .then(findFirst);
};

export async function getSession(id: any) {
  return await db
    .select({
      ...getTableColumns(users),
      store: getTableColumns(stores),
    })
    .from(users)
    .leftJoin(stores, eq(stores.id, users.storeId))
    .where(eq(users.id, id))
    .then(findFirst);
}
