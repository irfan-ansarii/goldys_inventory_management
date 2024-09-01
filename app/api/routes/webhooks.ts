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

    /** find store */
    const { data } = await getStores();
    const store = data.find((s) => s.domain === domain);

    if (!store)
      throw new HTTPException(400, { message: "Domain not found, skipping.." });

    const webhookOrder = await c.req.json();

    console.log(webhookOrder.name, "-", "Event", topic);

    const isFulfilled =
      topic === "orders/updated" && webhookOrder.fulfillment_status !== null;

    if (isFulfilled) {
      throw new HTTPException(400, { message: "Fulfilled order skipping..." });
    }

    if (topic === "orders/create") {
      limiter.schedule({ priority: 1 }, () =>
        handleWebhhokOrder({ data: webhookOrder, store, topic: "create" })
      );
    } else if (topic === "orders/updated") {
      limiter.schedule({ priority: 2 }, () =>
        handleWebhhokOrder({ data: webhookOrder, store, topic: "update" })
      );
    }

    return c.json({ success: true }, 200);
  })

  .get("/tracking", async (c) => {
    limiter.schedule(() => new Promise((res, rej) => res(true)));

    const counts = limiter.counts();

    console.log(counts);
    return c.json({ success: true }, 200);
  });

export default app;
