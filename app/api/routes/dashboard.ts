import { z } from "zod";
import { Hono } from "hono";

import { getZonedTime, INTERVAL_MAP, IntervalKey } from "../utils";
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
  timeZone: z.string().optional(),
});

const app = new Hono()

  /********************************************************************* */
  /**                            GET OVERVIEW                            */
  /********************************************************************* */
  .get("/overview", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const response = await getOverview(storeId, intervalMap);

    return c.json({ success: true, data: response }, 200);
  })

  /********************************************************************* */
  /**                           GET TRANSACTIONS                         */
  /********************************************************************* */
  .get("/transactions", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const response = await getTransactionsOverview(storeId, intervalMap);

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
      const { interval, timeZone } = c.req.valid("query");

      const intervalMap = getZonedTime(interval, timeZone);

      const response = await getPurchaseTransactionsOverview(
        storeId,
        intervalMap
      );

      return c.json({ success: true, data: response }, 200);
    }
  )
  /********************************************************************* */
  /**                           GET EXPENSES                         */
  /********************************************************************* */
  .get("/expenses", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const response = await getExpensesOverview(storeId, intervalMap);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET EMPLOYEE                           */
  /********************************************************************* */
  .get("/employee", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const response = await getEmployeesOverview(storeId, intervalMap);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET CUSTOMER                           */
  /********************************************************************* */
  .get("/customer", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const response = await getCustomersOverview(storeId, intervalMap);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET PRODUCTS                           */
  /********************************************************************* */
  .get("/products", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const response = await getProductsOverview(storeId, intervalMap);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET PRODUCTS                           */
  /********************************************************************* */
  .get("/adjustments", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const response = await getAdjustmentsOverview(storeId, intervalMap);

    return c.json({ success: true, data: response }, 200);
  })
  /********************************************************************* */
  /**                             GET SHIPMENTS                          */
  /********************************************************************* */
  .get("/shipments", validator("query", intervalSchema), async (c) => {
    const { storeId } = c.get("jwtPayload");
    const { interval, timeZone } = c.req.valid("query");

    const intervalMap = getZonedTime(interval, timeZone);

    const { shipment, pending } = await getShipmentsOverview(
      storeId,
      intervalMap
    );

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
