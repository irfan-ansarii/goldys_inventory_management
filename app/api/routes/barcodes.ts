import { Hono } from "hono";
import { z } from "zod";
import { validator } from "../utils";

import { HTTPException } from "hono/http-exception";

import {
  createBarcodes,
  deleteBarcode,
  getBarcode,
  getBarcodes,
  updateBarcode,
} from "@/drizzle/services/barcodes";

const createSchema = z.object({
  lineItems: z
    .object({
      productId: z.number(),
      variantId: z.number(),
      quantity: z.number(),
    })
    .array(),
});

const updateSchema = z.object({
  quantity: z.number(),
  status: z.string(),
});
const app = new Hono()

  /********************************************************************* */
  /**                          CREATE BARCODE                         */
  /********************************************************************* */
  .post("/", validator("json", createSchema), async (c) => {
    const { id, storeId } = c.get("jwtPayload");

    const { lineItems } = c.req.valid("json");

    const createData = lineItems.map((item) => ({
      ...item,
      status: "pending",
      storeId,
      createdBy: id,
      updatedBy: id,
    }));

    const result = await createBarcodes(createData);

    return c.json({ success: true, data: result }, 201);
  })

  /********************************************************************* */
  /**                            GET BARCODES                         */
  /********************************************************************* */
  .get("/", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const query = c.req.query();

    const { data, meta } = await getBarcodes({ storeId, ...query });
    console.log(meta);
    return c.json({ success: true, data, meta }, 200);
  })

  /********************************************************************* */
  /**                             GET BARCODE                            */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { id } = c.req.param();
    const response = await getBarcode(id);

    if (!response || response.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    return c.json({ success: true, data: { ...response } }, 200);
  })

  /********************************************************************* */
  /**                            UPDATE ABARCODE                         */
  /********************************************************************* */
  .put("/:id", validator("json", updateSchema), async (c) => {
    const { id: userId, storeId } = c.get("jwtPayload");
    const { id } = c.req.param();
    const data = c.req.valid("json");

    const response = await getBarcode(id);

    if (!response || response.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    const result = await updateBarcode(id, {
      ...data,
      updatedBy: userId,
    });

    return c.json({ success: true, data: result }, 200);
  })

  /********************************************************************* */
  /**                            DELETE BARCODE                          */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { id } = c.req.param();

    const response = await getBarcode(id);

    if (!response || response.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    const result = await deleteBarcode(id);

    return c.json({ success: true, data: { ...result } }, 200);
  })

  /********************************************************************* */
  /**                            PRINT BARCODES                          */
  /********************************************************************* */
  .post("/bulk-print", async (c) => {
    const { storeId, id: userId } = c.get("jwtPayload");

    const response = [];
    let page: number | null = 1;

    while (page !== null) {
      const { data, meta } = await getBarcodes({
        status: "pending",
        storeId,
        page,
      });

      if (data.length === 0) {
        throw new HTTPException(400, { message: "No barcode data to print" });
      }
      response.push(...data);
      // change status to printed
      const updatePromises = data.map((item) =>
        updateBarcode(item.id, {
          ...item,
          status: "printed",
          updatedBy: userId,
          createdBy: item.createdBy?.id!,
        })
      );
      await Promise.all(updatePromises);
      page == meta.pages ? (page = null) : page++;
    }
    return c.json({ data: response, success: true }, 200);
  })
  /********************************************************************* */
  /**                           CREATE AND PRINT                         */
  /********************************************************************* */
  .post("/print", validator("json", createSchema), async (c) => {
    const { storeId, id: userId } = c.get("jwtPayload");

    // create barcode entry in database
    const { lineItems } = c.req.valid("json");
    const createData = lineItems.map((item) => ({
      ...item,
      status: "printed",
      storeId,
      createdBy: userId,
      updatedBy: userId,
    }));

    const results = await createBarcodes(createData);

    // throw error if data not created
    if (!results || results.length === 0)
      throw new HTTPException(400, { message: "No barcode data to print" });

    const { data } = await getBarcodes({ ids: results.map((r) => r.id) });

    return c.json({ data, success: true }, 200);
  });

export default app;
