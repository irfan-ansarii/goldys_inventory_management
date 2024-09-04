import { Hono } from "hono";

import { getStores } from "@/drizzle/services/stores";
import { HTTPException } from "hono/http-exception";

import { limiter } from "@/lib/utils";
import { handleWebhhokOrder } from "../webhook-order";

const app = new Hono()
  /********************************************************************* */
  /**                            CHANNEL WEBHOOK                            */
  /********************************************************************* */
  .post("/channel", async (c) => {
    const topic = c.req.header("x-shopify-topic");
    const domain = c.req.header("X-Shopify-Shop-Domain");

    console.log("domain:::", domain);
    const { data } = await getStores();
    const store = data.find((s) => s.domain === domain);

    if (!store)
      throw new HTTPException(400, { message: "Domain not found, skipping.." });

    const webhookOrder = await c.req.json();

    const isFulfilled =
      topic === "orders/updated" && webhookOrder.fulfillment_status !== null;

    if (isFulfilled) {
      console.log("Fulfilled order skipping...");
      return;
    }

    limiter.schedule(() => handleWebhhokOrder({ data: webhookOrder, store }));

    console.log(`Scheduled ${topic} event for order ${webhookOrder.name}...`);

    const counts = limiter.counts();

    console.log("scheduler task::", counts);

    const a = limiter.jobs();
    console.log("jobs:", a);
    return c.json({ success: true }, 200);
  })

  .get("/tracking", async (c) => {
    // handle shiprocket updates
    limiter.schedule(() => new Promise((res) => res(true)));

    const counts = limiter.counts();

    console.log(counts);
    return c.json({ success: true }, 200);
  });

export default app;
