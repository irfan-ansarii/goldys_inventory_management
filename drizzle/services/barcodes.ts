import { z } from "zod";
import { db, findFirst } from "../db";
import {
  barcodeCreateSchema,
  barcodes,
  products,
  variants,
} from "../schemas/products";
import {
  eq,
  getTableColumns,
  ilike,
  or,
  and,
  count,
  desc,
  inArray,
} from "drizzle-orm";
import { users } from "../schemas/users";
import { alias } from "drizzle-orm/pg-core";
import { PAGE_LIMIT } from "@/app/api/utils";
const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

type CreateType = z.infer<typeof barcodeCreateSchema>;

// insert barcode
export const createBarcodes = async (values: CreateType | CreateType[]) => {
  const insertValues = Array.isArray(values) ? values : [values];

  return await db.insert(barcodes).values(insertValues).returning();
};

// get barcode by id
export const getBarcode = async (id: any) => {
  return await db
    .select({
      ...getTableColumns(barcodes),
      title: products.title,
      variantTitle: variants.title,
      image: products.image,
      barcode: variants.barcode,
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(barcodes)
    .leftJoin(createdBy, eq(createdBy.id, barcodes.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, barcodes.updatedBy))
    .leftJoin(products, eq(products.id, barcodes.productId))
    .leftJoin(variants, eq(variants.id, barcodes.variantId))
    .where(eq(barcodes.id, id))
    .then(findFirst);
};

// get barocdes
export const getBarcodes = async (params: Record<string, any>) => {
  const { storeId, q, status, ids, page = 1, limit = PAGE_LIMIT } = params;

  const filters = and(
    storeId ? eq(barcodes.storeId, storeId) : undefined,
    status ? eq(barcodes.status, status) : undefined,
    or(
      q
        ? or(
            ilike(products.title, `%${q}%`),
            ilike(variants.title, `%${q}%`),
            ilike(variants.barcode, `%${q}%`)
          )
        : undefined
    ),
    ids && ids.length > 0 ? inArray(barcodes.id, ids) : undefined
  );

  const results = await db
    .select({
      ...getTableColumns(barcodes),
      title: products.title,
      variantTitle: variants.title,
      image: products.image,
      barcode: variants.barcode,
      salePrice: variants.salePrice,
      options: variants.options,
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(barcodes)
    .leftJoin(createdBy, eq(createdBy.id, barcodes.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, barcodes.updatedBy))
    .leftJoin(products, eq(products.id, barcodes.productId))
    .leftJoin(variants, eq(variants.id, barcodes.variantId))
    .where(filters)
    .orderBy(desc(barcodes.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(barcodes) })
    .from(barcodes)
    .where(filters)
    .then(findFirst);

  return {
    data: results,
    meta: {
      page: parseInt(page),
      size: limit,
      pages: Math.max(1, Math.ceil(records.total / limit)),
      ...records,
    },
  };
};

// update barcode
export const updateBarcode = async (
  id: any,
  values: z.infer<typeof barcodeCreateSchema>
) => {
  return await db
    .update(barcodes)
    .set(values)
    .where(eq(barcodes.id, id))
    .returning()
    .then(findFirst);
};

// delete barcode
export const deleteBarcode = async (id: any) => {
  return await db
    .delete(barcodes)
    .where(eq(barcodes.id, id))
    .returning()
    .then(findFirst);
};
