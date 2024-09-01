import { alias } from "drizzle-orm/pg-core";
import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { users } from "../schemas/users";
import { db, findFirst } from "../db";

import { PAGE_LIMIT } from "@/app/api/utils";
import {
  purchase,
  purchaseLineItems,
  purchaseTransactions,
} from "../schemas/purchase";

const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

const supplier = alias(users, "supplier");

// create purchase
export const createPurchase = async (values: any) => {
  return await db
    .insert(purchase)
    .values({ ...values })
    .returning()
    .then(findFirst);
};

// create purchase line items
export const createPurchaseLineItems = async (values: any) => {
  return await db.insert(purchaseLineItems).values(values).returning();
};

// update purchase
export const updatePurchase = async (id: any, values: any) => {
  return await db
    .update(purchase)
    .set(values)
    .where(eq(purchase.id, id))
    .returning()
    .then(findFirst);
};

// update purchase line-item
export const updatePurchaseLineItem = async (id: any, values: any) => {
  return await db
    .update(purchaseLineItems)
    .set(values)
    .where(eq(purchaseLineItems.id, id))
    .returning()
    .then(findFirst);
};

// remove purchase
export const deletePurchase = async (id: any) => {
  return await db
    .delete(purchase)
    .where(eq(purchase.id, id))
    .returning()
    .then(findFirst);
};

// get purchases
export const getPurchases = async (params: Record<string, any>) => {
  const { q, status, limit = PAGE_LIMIT, page = 1, storeId } = params || {};

  const results = await db
    .select({
      ...getTableColumns(purchase),
      supplier: {
        id: supplier.id,
        name: supplier.name,
      },
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(purchase)
    .leftJoin(createdBy, eq(createdBy.id, purchase.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, purchase.updatedBy))
    .leftJoin(supplier, eq(supplier.id, purchase.supplierId))
    .where(eq(purchase.storeId, storeId))
    .groupBy(purchase.id, supplier.id, createdBy.id, updatedBy.id)
    .orderBy(desc(purchase.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(purchase) })
    .from(purchase)
    .where(eq(purchase.storeId, storeId))
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

// get purchase line items
export const getPurchaseLineItems = async (purchaseId: any) => {
  return await db
    .select({
      ...getTableColumns(purchaseLineItems),
    })
    .from(purchaseLineItems)
    .where(eq(purchaseLineItems.purchaseId, purchaseId));
};

// get pucrhase by id
export const getPurchase = async (id: any) => {
  return await db
    .select({
      ...getTableColumns(purchase),
      supplier: {
        id: users.id,
        name: users.name,
        phone: users.phone,
        email: users.email,
        source: purchase.source,
      },
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(purchase)
    .leftJoin(createdBy, eq(createdBy.id, purchase.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, purchase.updatedBy))
    .leftJoin(users, eq(users.id, purchase.supplierId))

    .where(eq(purchase.id, id))
    .groupBy(purchase.id, users.id, createdBy.id, updatedBy.id)
    .then(findFirst);
};

// create purchase transactions
export const createPurchaseTransactions = async (values: any) => {
  return await db.insert(purchaseTransactions).values(values).returning();
};

// get purchase transactions
export const getPurchaseTransactions = async (purchaseId: any) => {
  return await db
    .select()
    .from(purchaseTransactions)
    .where(eq(purchaseTransactions.purchaseId, purchaseId));
};
