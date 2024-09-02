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
      console.log("Fulfilled order skipping...");
      return;
    }

    const jobStatus = limiter.jobStatus(`${webhookOrder.id}`);
    console.log(jobStatus);
    if (jobStatus && jobStatus !== "DONE") {
      console.log("Job is already in the queue skipping...");
      return;
    }

    if (topic === "orders/create") {
      limiter.schedule({ priority: 5, id: `${webhookOrder.id}` }, () =>
        handleWebhhokOrder({ data: webhookOrder, store, topic: "create" })
      );
    } else if (topic === "orders/updated") {
      limiter.schedule({ priority: 9, id: `${webhookOrder.id}` }, () =>
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
