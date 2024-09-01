import { z } from "zod";
import { db, findFirst } from "../db";
import {
  adjustmentCreateSchema,
  adjustments,
  products,
  transferCreateSchema,
  variants,
} from "../schemas/products";
import { eq, getTableColumns, ilike, or, and, desc, count } from "drizzle-orm";
import { users } from "../schemas/users";
import { alias } from "drizzle-orm/pg-core";
import { PAGE_LIMIT } from "@/app/api/utils";

const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

export const createAdjustments = async (
  values: z.infer<typeof adjustmentCreateSchema>[]
) => {
  return await db.insert(adjustments).values(values).returning();
};

export const getAdjustment = async (id: any) => {
  return await db
    .select({
      ...getTableColumns(adjustments),
      title: products.title,
      variantTitle: variants.title,
      image: products.image,
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(adjustments)
    .leftJoin(products, eq(products.id, adjustments.productId))
    .leftJoin(variants, eq(variants.id, adjustments.variantId))
    .leftJoin(createdBy, eq(createdBy.id, adjustments.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, adjustments.updatedBy))
    .where(eq(adjustments.id, id))
    .then(findFirst);
};

export const getAdjustments = async (params: Record<string, any>) => {
  const { storeId, q, page = 1, limit = PAGE_LIMIT } = params;

  const filters = and(
    storeId ? eq(adjustments.storeId, storeId) : undefined,
    or(
      q
        ? or(
            ilike(products.title, `%${q}%`),
            ilike(variants.title, `%${q}%`),
            ilike(variants.barcode, `%${q}%`),
            ilike(adjustments.reason, `%${q}%`),
            ilike(adjustments.notes, `%${q}%`)
          )
        : undefined
    )
  );

  const results = await db
    .select({
      ...getTableColumns(adjustments),
      title: products.title,
      variantTitle: variants.title,
      image: products.image,

      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(adjustments)
    .leftJoin(products, eq(products.id, adjustments.productId))
    .leftJoin(variants, eq(variants.id, adjustments.variantId))
    .leftJoin(createdBy, eq(createdBy.id, adjustments.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, adjustments.updatedBy))
    .where(filters)
    .orderBy(desc(adjustments.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(adjustments) })
    .from(adjustments)
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

export const updateAdjustment = async (
  id: any,
  values: z.infer<typeof transferCreateSchema>
) => {
  return await db
    .update(adjustments)
    .set(values)
    .where(eq(adjustments.id, id))
    .returning()
    .then(findFirst);
};

export const deleteAdjustment = async (id: any) => {
  return await db
    .delete(adjustments)
    .where(eq(adjustments.id, id))
    .returning()
    .then(findFirst);
};
