import { z } from "zod";
import { Hono } from "hono";
import { adjustmentCreateSchema } from "@/drizzle/schemas/products";

import { HTTPException } from "hono/http-exception";

import {
  deleteAdjustment,
  getAdjustment,
  getAdjustments,
} from "@/drizzle/services/adjustments";
import { updateStock, validator } from "../utils";

const createSchema = adjustmentCreateSchema
  .omit({
    id: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    lineItems: z
      .object({
        productId: z.number(),
        variantId: z.number(),
        quantity: z.number(),
      })
      .array(),
  });
const app = new Hono()

  /********************************************************************* */
  /**                          CREATE ADJUSTMENT                         */
  /********************************************************************* */
  .post("/", validator("json", createSchema), async (c) => {
    const { id, storeId } = c.get("jwtPayload");

    const data = c.req.valid("json");

    const { lineItems, ...rest } = data;

    const itemsToCreate = lineItems.map((item) => ({
      ...item,
      ...rest,
      storeId,
      createdBy: id,
      updatedBy: id,
    }));

    const response = await updateStock(storeId, itemsToCreate);

    return c.json({ success: true, data: response }, 200);
  })

  /********************************************************************* */
  /**                            GET ADJUSTMENTS                         */
  /********************************************************************* */
  .get("/", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const query = c.req.query();

    const { data, meta } = await getAdjustments({ storeId, ...query });

    return c.json({ success: true, data, meta }, 200);
  })

  /********************************************************************* */
  /**                            GET ADJUSTMENT                          */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { id } = c.req.param();
    const response = await getAdjustment(id);

    if (!response || response.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    return c.json({ success: true, data: { ...response } }, 200);
  })

  // delete method is not being used anywhere as of now
  /********************************************************************* */
  /**                           DELETE ADJUSTMENT                        */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { storeId, role } = c.get("jwtPayload");
    const { id } = c.req.param();

    const response = await getAdjustment(id);

    if (!response || response.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    if (role !== "admin")
      throw new HTTPException(403, { message: "Forbidden" });

    const result = await deleteAdjustment(id);

    return c.json({ success: true, data: { ...result } }, 200);
  });

export default app;
