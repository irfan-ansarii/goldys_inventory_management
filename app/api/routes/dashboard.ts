import { z } from "zod";
import { Hono } from "hono";

import { INTERVAL_MAP, IntervalKey } from "../utils";
import { validator } from "../utils";
import {
  getAdjustmentsOverview,
  getCustomersOverview,
  getEmployeesOverview,
  getExpensesOverview,
  getOverview,
  getProductsOverview,
  getPurchaseTransactionsOverview,
  getShipmentsOverview,
  getTransactionsOverview,
} from "@/drizzle/services/dashboard";
import { addDays, isAfter } from "date-fns";

const intervalKeys = Object.keys(INTERVAL_MAP) as Array<IntervalKey>;

const intervalSchema = z.object({
  interval: z.enum(intervalKeys as [IntervalKey, ...IntervalKey[]]),
});

const app = new Hono()

  /********************************************************************* */
  /**                            GET OVERVIEW                            */
  /********************************************************************* */
  .get("/overview", validator("query", intervalSchema), async (c) => {
    const { id, storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const response = await getOverview(interval, storeId);

    return c.json({ success: true, data: response }, 200);
  })

  /********************************************************************* */
  /**                           GET TRANSACTIONS                         */
  /********************************************************************* */
  .get("/transactions", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const response = await getTransactionsOverview(interval, storeId);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                       GET PURCHASE TRANSACTIONS                    */
  /********************************************************************* */
  .get(
    "/purchase-transactions",
    validator("query", intervalSchema),
    async (c) => {
      const { storeId } = c.get("jwtPayload");
      const { interval } = c.req.valid("query");

      const response = await getPurchaseTransactionsOverview(interval, storeId);

      return c.json({ success: true, data: response }, 200);
    }
  )
  /********************************************************************* */
  /**                           GET EXPENSES                         */
  /********************************************************************* */
  .get("/expenses", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const response = await getExpensesOverview(interval, storeId);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET EMPLOYEE                           */
  /********************************************************************* */
  .get("/employee", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const response = await getEmployeesOverview(interval, storeId);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET CUSTOMER                           */
  /********************************************************************* */
  .get("/customer", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const response = await getCustomersOverview(interval, storeId);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET PRODUCTS                           */
  /********************************************************************* */
  .get("/products", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const response = await getProductsOverview(interval, storeId);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET PRODUCTS                           */
  /********************************************************************* */
  .get("/adjustments", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const response = await getAdjustmentsOverview(interval, storeId);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET SHIPMENTS                          */
  /********************************************************************* */
  .get("/shipments", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval } = c.req.valid("query");

    const { shipment, pending } = await getShipmentsOverview(interval, storeId);

    let delayed = 0;
    let processing = 0;

    pending?.forEach((item) => {
      const isDelayed = isAfter(new Date(), addDays(item.createdAt!, 7));

      if (isDelayed) delayed++;
      else processing++;
    });

    shipment.push(
      // @ts-expect-error
      { name: "delayed", total: delayed },
      { name: "orders", total: processing }
    );
    return c.json(
      {
        success: true,
        data: shipment,
      },
      200
    );
  });

export default app;
