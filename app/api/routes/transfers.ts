import { Hono } from "hono";
import { z } from "zod";
import {
  transferCreateSchema,
  lineItemCreateSchema,
} from "@/drizzle/schemas/products";
import { validator } from "../utils";
import {
  createLineItems,
  createTransfer,
  deleteTransfer,
  getLineItems,
  getTransfer,
  getTransfers,
  updateTransfer,
} from "@/drizzle/services/transfers";
import { HTTPException } from "hono/http-exception";
import { getInventories, updateInventory } from "@/drizzle/services/products";
import { createAdjustments } from "@/drizzle/services/adjustments";

const createSchema = transferCreateSchema
  .omit({
    id: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    destination: z.number(),
    lineItems: lineItemCreateSchema
      .omit({
        createdAt: true,
        updatedAt: true,
      })
      .array(),
  });

const app = new Hono()

  /********************************************************************* */
  /**                           CREATE TRANSFER                          */
  /********************************************************************* */
  .post("/", validator("json", createSchema), async (c) => {
    const { id, storeId } = c.get("jwtPayload");

    const data = c.req.valid("json");

    const { lineItems, ...rest } = data;

    const result = await createTransfer({
      ...rest,
      createdBy: id,
      updatedBy: id,
      source: storeId,
    });

    const lineItemData = lineItems.map((item) => ({
      ...item,
      transferId: result.id,
    }));

    const createdLineItems = await createLineItems(lineItemData);

    const variantIds = createdLineItems.map((line) => line.variantId);

    // get the inventories
    const [{ data: sourceInventories }, { data: destinationInventories }] =
      await Promise.all([
        getInventories({ storeId, variantIds }),
        getInventories({ storeId: data.destination, variantIds }),
      ]);

    // reduce stock
    const updateSourceInventories = sourceInventories.map((source) => {
      const created = createdLineItems.find(
        (created) => created.variantId === source.variantId
      );
      return updateInventory(source.id, {
        stock: (source.stock || 0) - (created?.quantity || 0),
      });
    });

    // increase stock
    const updateDestinationInventories = destinationInventories.map(
      (destination) => {
        const created = createdLineItems.find(
          (created) => created.variantId === destination.variantId
        );
        return updateInventory(destination.id, {
          stock: (destination.stock || 0) + (created?.quantity || 0),
        });
      }
    );

    // create adjustments
    const adjustments = createdLineItems.flatMap((item) =>
      [
        { storeId: parseInt(storeId), quantity: -item.quantity },
        { storeId: rest.destination, quantity: item.quantity },
      ].map((adj) => ({
        ...adj,
        productId: item.productId,
        variantId: item.variantId,
        reason: "internal transfer",
        createdBy: id,
        updatedBy: id,
      }))
    );

    await createAdjustments(adjustments);

    await Promise.all([
      ...updateSourceInventories,
      ...updateDestinationInventories,
    ]);

    return c.json(
      { success: true, data: { ...result, ...createdLineItems } },
      200
    );
  })

  /********************************************************************* */
  /**                             GET TRANSFERS                          */
  /********************************************************************* */
  .get("/", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const query = c.req.queries();

    const { data, meta } = await getTransfers({ storeId, ...query });

    const modifiedResponse = data
      .map((item) => ({
        ...item,
        type: item.source === storeId ? "out" : "in",
      }))
      .filter((item) => item !== null);

    const results = await Promise.all(
      modifiedResponse.map(async (item) => {
        return {
          ...item,
          lineItems: await getLineItems({
            transferId: item.id,
          }),
        };
      })
    );

    return c.json({ success: true, data: results, meta }, 200);
  })

  /********************************************************************* */
  /**                             GET TRANSFER                           */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { id } = c.req.param();
    const response = await getTransfer(id);

    const isOwnData =
      response.source !== storeId && response.destination !== storeId;

    if (!response || !isOwnData)
      throw new HTTPException(404, { message: "Not Found" });

    const result = {
      ...response,
      type: response.source === storeId ? "out" : "in",
      lineItems: await getLineItems({
        transferId: response.id,
      }),
    };

    return c.json({ success: true, data: result }, 200);
  })

  /********************************************************************* */
  /**                            UPDATE TRANSFER                         */
  /********************************************************************* */
  .put("/:id", validator("json", createSchema), async (c) => {
    const { id: userId, storeId } = c.get("jwtPayload");
    const { id } = c.req.param();
    const data = c.req.valid("json");

    const { lineItems, ...rest } = data;

    const response = await getTransfer(id);

    if (!response || response.source !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    const result = updateTransfer(id, {
      ...rest,
      updatedBy: userId,
    });

    // update remove and add line items
    return c.json({ success: true, data: { ...result } }, 200);
  })

  /********************************************************************* */
  /**                            DELETE TRANSFER                         */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { storeId, role } = c.get("jwtPayload");
    const { id } = c.req.param();

    const response = await getTransfer(id);

    if (!response) throw new HTTPException(404, { message: "Not Found" });

    if (response.source !== storeId)
      throw new HTTPException(403, { message: "Forbidden" });

    const result = await deleteTransfer(id);

    return c.json({ success: true, data: { ...result } }, 200);
  });

export default app;
