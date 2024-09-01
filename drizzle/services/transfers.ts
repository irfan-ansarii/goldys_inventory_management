import { z } from "zod";
import { db, findFirst } from "../db";
import {
  lineItemCreateSchema,
  products,
  transferCreateSchema,
  transferLineItems,
  transfers,
} from "../schemas/products";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sum,
} from "drizzle-orm";
import { users } from "../schemas/users";
import { alias } from "drizzle-orm/pg-core";
import { PAGE_LIMIT } from "@/app/api/utils";
const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

export const createTransfer = async (
  values: z.infer<typeof transferCreateSchema>
) => {
  return await db.insert(transfers).values(values).returning().then(findFirst);
};

export const getTransfer = async (id: any) => {
  return await db
    .select({
      ...getTableColumns(transfers),
      lineItemCount: sum(transferLineItems.quantity),
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(transfers)
    .leftJoin(transferLineItems, eq(transferLineItems.transferId, transfers.id))
    .leftJoin(createdBy, eq(createdBy.id, transfers.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, transfers.updatedBy))
    .where(eq(transfers.id, id))
    .then(findFirst);
};

export const getTransfers = async (params: Record<string, any>) => {
  const { storeId, q, page = 1, limit = PAGE_LIMIT } = params;

  const filters = and(
    storeId
      ? or(eq(transfers.source, storeId), eq(transfers.destination, storeId))
      : undefined,
    or(
      q
        ? or(
            ilike(transferLineItems.title, `%${q}%`),
            ilike(transferLineItems.variantTitle, `%${q}%`),
            ilike(transferLineItems.barcode, `%${q}%`)
          )
        : undefined
    )
  );

  const results = await db
    .select({
      ...getTableColumns(transfers),
      lineItemCount: sum(transferLineItems.quantity),

      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(transfers)
    .leftJoin(transferLineItems, eq(transferLineItems.transferId, transfers.id))
    .leftJoin(createdBy, eq(createdBy.id, transfers.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, transfers.updatedBy))
    .where(filters)
    .groupBy(transfers.id, createdBy.id, updatedBy.id)
    .orderBy(desc(transfers.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(transfers) })
    .from(transfers)
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

export const updateTransfer = async (
  id: any,
  values: z.infer<typeof transferCreateSchema>
) => {
  return await db
    .update(transfers)
    .set(values)
    .where(eq(transfers.id, id))
    .returning()
    .then(findFirst);
};

export const deleteTransfer = async (id: any) => {
  return await db
    .delete(transfers)
    .where(eq(transfers.id, id))
    .returning()
    .then(findFirst);
};

export const createLineItems = async (
  values: z.infer<typeof lineItemCreateSchema>[]
) => {
  return await db.insert(transferLineItems).values(values).returning();
};

export const updateLineItem = async (
  id: any,
  values: z.infer<typeof lineItemCreateSchema>
) => {
  return await db
    .update(transferLineItems)
    .set(values)
    .where(eq(transferLineItems.id, id))
    .returning()
    .then(findFirst);
};

export const deleteLineItem = async (id: any) => {
  return await db
    .delete(transferLineItems)
    .where(eq(transferLineItems.id, id))
    .returning()
    .then(findFirst);
};

export const getLineItems = async (params: Record<string, any>) => {
  const { transferId } = params;

  return await db
    .select({
      ...getTableColumns(transferLineItems),
      image: products.image,
    })
    .from(transferLineItems)
    .leftJoin(products, eq(products.id, transferLineItems.productId))
    .where(eq(transferLineItems.transferId, transferId));
};
