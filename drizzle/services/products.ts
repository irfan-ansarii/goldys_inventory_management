import { record, z } from "zod";
import {
  eq,
  or,
  and,
  ilike,
  desc,
  inArray,
  getTableColumns,
  count,
  sql,
  countDistinct,
} from "drizzle-orm";
import { db, findFirst } from "../db";

import {
  inventory,
  inventoryCreateSchema,
  productCreateSchema,
  products,
  variantCreateSchema,
  variants,
} from "../schemas/products";
import { alias } from "drizzle-orm/pg-core";
import { users } from "../schemas/users";
import { stores } from "../schemas";
import { PAGE_LIMIT } from "@/app/api/utils";
const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

const inventorySchema = inventoryCreateSchema.pick({
  stock: true,
});

// create product
export async function createProduct(
  values: z.infer<typeof productCreateSchema>
) {
  return await db
    .insert(products)
    .values({ ...values })
    .returning()
    .then(findFirst);
}

// get product
export async function getProduct(id: any) {
  return await db
    .select({
      ...getTableColumns(products),
      variantCount: count(variants),
      stockCount: sql`SUM(COALESCE(${inventory.stock}, 0))`,
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(products)
    .leftJoin(createdBy, eq(createdBy.id, products.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, products.updatedBy))
    .leftJoin(variants, eq(variants.productId, products.id))
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(eq(products.id, id))
    .groupBy(products.id, createdBy.id, updatedBy.id)
    .then(findFirst);
}

// get products
export async function getProducts(params?: Record<string, any>) {
  const { q, status, limit = PAGE_LIMIT, page = 1 } = params || {};

  const filters = and(
    status ? eq(products.status, status) : undefined,
    q
      ? or(
          ilike(products.title, `%${q}%`),
          ilike(products.description, `%${q}%`),
          ilike(variants.title, `%${q}%`)
        )
      : undefined
  );

  const results = await db
    .select({
      ...getTableColumns(products),
      stockCount: sql`SUM(COALESCE(${inventory.stock}, 0))`,
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(products)
    .leftJoin(createdBy, eq(createdBy.id, products.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, products.updatedBy))
    .leftJoin(variants, eq(variants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, variants.id))
    .where(filters)
    .groupBy(products.id, updatedBy.id, createdBy.id)
    .orderBy(desc(products.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: countDistinct(products.id) })
    .from(products)
    .leftJoin(variants, eq(variants.productId, products.id))
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

// update product
export async function updateProduct(
  id: any,
  values: z.infer<typeof productCreateSchema>
) {
  return await db
    .update(products)
    .set(values)
    .where(eq(products.id, id))
    .returning()
    .then(findFirst);
}

// delete product
export async function deleteProduct(id: any) {
  return await db
    .delete(products)
    .where(eq(products.id, id))
    .returning()
    .then(findFirst);
}

// create variants
export async function createVariants(
  values: z.infer<typeof variantCreateSchema>[]
) {
  return await db.insert(variants).values(values).returning();
}

// get variants
export async function getVariants(params?: { productId?: any; ids?: any[] }) {
  const { productId, ids } = params || {};

  return await db
    .select({
      ...getTableColumns(variants),
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(variants)
    .leftJoin(createdBy, eq(createdBy.id, variants.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, variants.updatedBy))
    .where(
      or(
        productId ? eq(variants.productId, productId) : undefined,
        ids && ids.length > 0 ? inArray(variants.id, ids) : undefined
      )
    );
}

// get variants with product
export async function getVariantsProduct(params?: Record<string, any>) {
  const { storeId, q, status, limit = PAGE_LIMIT, page = 1 } = params || {};

  const filters = and(
    status ? eq(products.status, status) : undefined,
    q
      ? or(
          ilike(products.title, `%${q}%`),
          ilike(products.description, `%${q}%`),
          ilike(variants.barcode, `%${q}%`),
          ilike(variants.sku, `%${q}%`),
          ilike(variants.title, `%${q}%`)
        )
      : undefined
  );

  const results = await db
    .select({
      ...getTableColumns(variants),
      product: getTableColumns(products),
      stock: sql`SUM(COALESCE(${inventory.stock}, 0))`,
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(variants)
    .leftJoin(products, eq(products.id, variants.productId))
    .leftJoin(createdBy, eq(createdBy.id, variants.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, variants.updatedBy))
    .leftJoin(
      inventory,
      and(
        eq(inventory.variantId, variants.id),
        storeId ? eq(inventory.storeId, storeId) : undefined
      )
    )
    .where(filters)
    .groupBy(variants.id, products.id, updatedBy.id, createdBy.id)
    .orderBy(desc(variants.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: countDistinct(variants.id) })
    .from(variants)
    .leftJoin(products, eq(variants.productId, products.id))
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

// update variant
export async function updateVariant(
  id: any,
  values: z.infer<typeof variantCreateSchema>
) {
  return await db
    .update(variants)
    .set({ ...values })
    .where(eq(variants.id, id))
    .returning()
    .then(findFirst);
}

// delete variants
export async function deleteVariants(ids: any[]) {
  return await db.delete(variants).where(inArray(variants.id, ids)).returning();
}

// create inventories
export async function createInventories(
  values: z.infer<typeof inventoryCreateSchema>[]
) {
  return await db.insert(inventory).values(values).returning();
}

// get inventory
export async function getInventory(id: any) {
  return await db
    .select()
    .from(inventory)
    .where(eq(inventory.id, id))
    .then(findFirst);
}

// get inventories
export async function getInventories(params: Record<string, any>) {
  const {
    productId,
    variantId,
    variantIds,
    storeId,
    page = 1,
    limit = PAGE_LIMIT,
  } = params;

  const filters = and(
    storeId ? eq(inventory.storeId, storeId) : undefined,
    or(
      productId ? eq(inventory.productId, productId) : undefined,
      variantId ? eq(inventory.variantId, variantId) : undefined,
      variantIds ? inArray(inventory.variantId, variantIds) : undefined
    )
  );

  const results = await db
    .select({
      ...getTableColumns(inventory),
      title: products.title,
      image: products.image,
      variantTitle: variants.title,
      barcode: variants.barcode,
      store: {
        id: stores.id,
        name: stores.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(inventory)
    .leftJoin(updatedBy, eq(updatedBy.id, inventory.updatedBy))
    .leftJoin(stores, eq(stores.id, inventory.storeId))
    .leftJoin(products, eq(products.id, inventory.productId))
    .leftJoin(variants, eq(variants.id, inventory.variantId))
    .where(filters)
    .orderBy(desc(inventory.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: count(inventory) })
    .from(inventory)
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

// update inventory
export async function updateInventory(
  id: any,
  values: z.infer<typeof inventorySchema>
) {
  return await db
    .update(inventory)
    .set(values)
    .where(eq(inventory.id, id))
    .returning()
    .then(findFirst);
}
