import { z } from "zod";
import { Hono } from "hono";
import { validator } from "../utils";
import { HTTPException } from "hono/http-exception";
import {
  inventoryCreateSchema,
  productCreateSchema,
  variantCreateSchema,
} from "@/drizzle/schemas/products";

import {
  createInventories,
  createProduct,
  createVariants,
  deleteProduct,
  deleteVariants,
  getInventories,
  getProduct,
  getProducts,
  getVariants,
  getVariantsProduct,
  updateProduct,
  updateVariant,
} from "@/drizzle/services/products";
import { getStores } from "@/drizzle/services/stores";

const productSchema = productCreateSchema
  .omit({
    id: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    variants: variantCreateSchema
      .omit({
        id: true,
        productId: true,
        createdBy: true,
        updatedBy: true,
        createdAt: true,
        updatedAt: true,
      })
      .array(),
  });

const productUpdateSchema = productCreateSchema
  .omit({
    id: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    variants: variantCreateSchema
      .omit({
        productId: true,
        createdBy: true,
        updatedBy: true,
        createdAt: true,
        updatedAt: true,
      })
      .array(),
  });

const generateBarcode = (id: number) => {
  return `GN${`${id}`.padStart(6, "0")}`;
};

const app = new Hono()

  /********************************************************************* */
  /**                            CREATE PRODUCT                          */
  /********************************************************************* */
  .post("/", validator("json", productSchema), async (c) => {
    const data = c.req.valid("json");
    const { id } = c.get("jwtPayload");
    const { variants, ...rest } = data;

    const { data: stores } = await getStores();

    const product = await createProduct({
      ...rest,
      createdBy: id,
      updatedBy: id,
    });

    const createdVariants = await createVariants(
      variants.map((v) => ({
        ...v,
        productId: product.id,
      }))
    );

    const updatedVariants = await Promise.all(
      createdVariants.map((variant) =>
        updateVariant(variant.id, {
          ...variant,
          options: variant.options as any[],
          barcode: generateBarcode(variant.id),
          createdBy: id,
          updatedBy: id,
        })
      )
    );

    const inventoriesToCreate = [];
    // organize inventory data
    for (const variant of createdVariants) {
      for (const store of stores) {
        inventoriesToCreate.push({
          storeId: store.id,
          productId: variant.productId!,
          variantId: variant.id,
          stock: 0,
          updatedBy: id,
        });
      }
    }

    // create inventories
    await createInventories(inventoriesToCreate);

    return c.json(
      { success: true, data: { ...product, variants: updatedVariants } },
      201
    );
  })

  /********************************************************************* */
  /**                            GET PRODUCTS                            */
  /********************************************************************* */
  .get("/", async (c) => {
    const query = c.req.query();

    const { data, meta } = await getProducts(query);

    const results = await Promise.all(
      data.map(async (item) => {
        const { data } = await getInventories({
          productId: item.id,
          limit: 100,
        });

        const reversed = data.reverse().reduce((acc, item) => {
          const { storeId, store, stock } = item;

          if (!acc[storeId]) {
            acc[storeId] = {
              storeId: storeId,
              storeName: store?.name!,
              products: [],
              stock: 0,
            };
          }
          acc[storeId].stock += stock;

          acc[storeId].products.push({
            id: item.id,
            title: item.variantTitle,
            stock,
          });

          return acc;
        }, {} as Record<any, any>);

        return {
          ...item,
          variants: await getVariants({ productId: item.id }),
          inventories: Object.values(reversed),
        };
      })
    );

    return c.json({ success: true, data: results, meta }, 200);
  })

  /********************************************************************* */
  /**                            GET VARIANTS                            */
  /********************************************************************* */
  .get("/variants", async (c) => {
    const query = c.req.query();
    const { storeId } = c.get("jwtPayload");

    const { data, meta } = await getVariantsProduct({ ...query, storeId });

    return c.json({ success: true, data: data, meta }, 200);
  })

  /********************************************************************* */
  /**                             GET PRUDUCT                            */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { id } = c.req.param();

    const result = await getProduct(id);

    if (!result) throw new HTTPException(404, { message: "Not Found" });

    const [variants, inventories] = await Promise.all([
      getVariants({ productId: result.id }),
      getInventories({ productId: result.id }),
    ]);

    return c.json(
      { success: true, data: { ...result, variants, inventories } },
      200
    );
  })

  /********************************************************************* */
  /**                           UPDATE PRODUCT                           */
  /********************************************************************* */
  .put("/:id", validator("json", productUpdateSchema), async (c) => {
    const { id } = c.req.param();
    const { id: userId } = c.get("jwtPayload");
    const data = c.req.valid("json");
    const { variants, ...rest } = data;

    const { data: stores } = await getStores();
    const product = await getProduct(id);

    if (!product) throw new HTTPException(404, { message: "Not Found" });

    const productResult = await updateProduct(id, {
      ...rest,
      updatedBy: userId,
    });

    const variantIds = variants.map((v) => v.id);

    const existingVariants = await getVariants({ productId: id });

    const variantsToUpdate = [];
    const variantsToDelete = [];
    const variantsToCreate = [];
    const inventoriesToCreate: z.infer<typeof inventoryCreateSchema>[] = [];

    for (const v of existingVariants) {
      if (variantIds.includes(v.id)) {
        variantsToUpdate.push({ ...v, updatedBy: userId });
      } else {
        variantsToDelete.push(v.id);
      }
    }

    // delete variants
    if (variantsToDelete?.length > 0) {
      await deleteVariants(variantsToDelete);
    }

    // update existing variants
    const updatedVariants = await Promise.all(
      variantsToUpdate.map((variant) =>
        updateVariant(variant.id, {
          ...variant,
          options: variant.options as any[],
          title: variant.title!,
          updatedBy: userId,
          createdBy: Number(variant.createdBy) || null,
        })
      )
    );

    // create new variants and update its barcode
    for (const variant of variants) {
      if (!variant.id) {
        variantsToCreate.push({
          ...variant,
          productId: Number(id),
          createdBy: userId,
          updatedBy: userId,
        });
      }
    }

    let createdVariants: z.infer<typeof variantCreateSchema>[] = [];
    if (variantsToCreate.length > 0) {
      // @ts-ignore
      createdVariants = await createVariants(variantsToCreate);
    }

    const updatedNewVariants = await Promise.all(
      createdVariants.map((variant) =>
        updateVariant(variant.id, {
          ...variant,
          barcode: generateBarcode(variant.id!),
        })
      )
    );

    // create inventories
    for (const variant of createdVariants) {
      for (const store of stores) {
        inventoriesToCreate.push({
          storeId: store.id,
          productId: Number(id),
          variantId: variant.id!,
          stock: 0,
          updatedBy: userId,
        });
      }
    }

    if (inventoriesToCreate.length > 0) {
      await createInventories(inventoriesToCreate);
    }

    return c.json(
      {
        success: true,
        data: {
          ...productResult,
          variants: updatedVariants.concat(updatedNewVariants),
        },
      },
      200
    );
  })

  /********************************************************************* */
  /**                           DELETE PRODUCT                           */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { id } = c.req.param();
    const { role } = c.get("jwtPayload");

    if (role !== "admin")
      throw new HTTPException(403, { message: "Forbidden" });

    const product = await getProduct(id);

    if (!product) throw new HTTPException(404, { message: "Not Found" });

    const result = await deleteProduct(id);

    return c.json({ success: true, data: result }, 200);
  });

export default app;
