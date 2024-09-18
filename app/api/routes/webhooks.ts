import { Hono } from "hono";
import { waitUntil } from "@vercel/functions";
import { getStores } from "@/drizzle/services/stores";
import { HTTPException } from "hono/http-exception";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { options } from "@/drizzle/schemas/options";

import { handleWebhhokOrder } from "../webhook-order";
import { handleShiprocketEvent } from "../shiprocket-event";

const app = new Hono()
  /********************************************************************* */
  /**                           SHOPIFY WEBHOOK                          */
  /********************************************************************* */
  .post("/channel", async (c) => {
    const topic = c.req.header("x-shopify-topic");
    const domain = c.req.header("X-Shopify-Shop-Domain");

    const { data } = await getStores();
    const store = data.find((s) => s.domain === domain);

    if (!store)
      throw new HTTPException(400, { message: "Domain not found, skipping.." });

    const webhookOrder = await c.req.json();

    const isFulfilled =
      topic === "orders/updated" && webhookOrder.fulfillment_status !== null;

    if (isFulfilled) {
      console.warn("Fulfilled order skipping...");
      return;
    }

    waitUntil(handleWebhhokOrder({ data: webhookOrder, store, topic }));

    console.log(`Event ${topic} order ${webhookOrder.name}...`);

    return c.json({ success: true }, 200);
  })
  /********************************************************************* */
  /**                          SHIPROCKET WEBHOOK                        */
  /********************************************************************* */
  .post("/tracking", async (c) => {
    const key = c.req.header("x-api-key");
    const payload = await c.req.json();

    console.log("shiprocket webhook event::", payload);

    const opts = await db
      .select()
      .from(options)
      .where(eq(options.key, "shiprocket-api-key"));

    const config = opts.find((s) => s.value === key);

    if (!config || config.value !== key)
      throw new HTTPException(400, { message: "Invalid key skipping..." });

    waitUntil(handleShiprocketEvent({ storeId: config.storeId, payload }));

    return c.json({ success: true }, 200);
  });

export default app;
