import { Hono } from "hono";
import { isPast } from "date-fns";
import { getTasks, updateTask } from "@/drizzle/services/tasks";

const app = new Hono()

  /********************************************************************* */
  /**                            PEDNING TASKS                           */
  /********************************************************************* */
  .get("/tasks", async (c) => {
    const { data } = await getTasks({
      statuses: ["pending", "on hold", "in progress"],
    });

    const overDueTasks = data.filter((task) => {
      if (task.dueAt && isPast(task.dueAt)) return true;
    });

    await Promise.all(
      overDueTasks.map((task) => {
        return updateTask(task.id, {
          ...task,
          status: "overdue",
        });
      })
    );

    return c.json({ success: true }, 200);
  })

  /********************************************************************* */
  /**                        SEND STORE SALE REPORTS                      */
  /********************************************************************* */
  .get("/reports", async (c) => {
    // get stores
    // get all orders where date is today
    // get transactions

    // total orders: 10
    // products sold: 14
    // order amount: 5345
    // payment received: 345
    // refund/credit note: 546764

    // if store has domain send these as well
    // shipped:54
    // rto initiated:45
    // rto delivered: 454
    // return initiated: 54
    // return delivered: 4545
    // pending orders: 55

    return c.json({ success: true }, 200);
  })
  /********************************************************************* */
  /**                             SYNC TRACKING                          */
  /********************************************************************* */
  .get("/tracking", async (c) => {
    // sync status from shiprocket
    return c.json({ success: true }, 200);
  });

export default app;
