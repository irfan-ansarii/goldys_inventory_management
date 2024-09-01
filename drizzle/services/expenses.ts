import { z } from "zod";
import { count, desc, eq, getTableColumns, or, and, ilike } from "drizzle-orm";
import { db, findFirst } from "../db";
import { expenseCreateSchema, expenses } from "../schemas/expenses";
import { alias } from "drizzle-orm/pg-core";
import { users } from "../schemas/users";
import { PAGE_LIMIT } from "@/app/api/utils";
const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

export const createExpense = async (
  values: z.infer<typeof expenseCreateSchema>
) => {
  return await db
    .insert(expenses)
    .values({
      ...values,
      createdAt: new Date(values.createdAt!),
    })
    .returning()
    .then(findFirst);
};

export const getExpense = async (id: any) => {
  return await db
    .select({
      ...getTableColumns(expenses),
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(expenses)
    .leftJoin(createdBy, eq(createdBy.id, expenses.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, expenses.updatedBy))
    .where(eq(expenses.id, id))
    .then(findFirst);
};

export const getExpenses = async (params?: Record<string, any>) => {
  const { storeId, q, cat, page = 1, limit = PAGE_LIMIT } = params || {};

  const filters = and(
    storeId ? eq(expenses.storeId, storeId) : undefined,
    cat ? ilike(expenses.category, `%${cat}%`) : undefined,
    q
      ? or(
          ilike(expenses.title, `%${q}%`),
          ilike(expenses.category, `%${q}%`),
          ilike(expenses.notes, `%${q}%`)
        )
      : undefined
  );

  const results = await db
    .select({
      ...getTableColumns(expenses),

      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(expenses)
    .leftJoin(createdBy, eq(createdBy.id, expenses.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, expenses.updatedBy))
    .where(filters)
    .orderBy(desc(expenses.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(expenses) })
    .from(expenses)
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
};

export const updateExpense = async (
  id: any,
  values: z.infer<typeof expenseCreateSchema>
) => {
  return await db
    .update(expenses)
    .set({
      ...values,
      createdAt: new Date(values.createdAt!),
    })
    .where(eq(expenses.id, id))
    .returning()
    .then(findFirst);
};

export const deleteExpense = async (id: any) => {
  return await db
    .delete(expenses)
    .where(eq(expenses.id, id))
    .returning()
    .then(findFirst);
};
