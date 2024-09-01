import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { deleteStore, getStores } from "@/drizzle/services/stores";
import { taskSchema } from "@/drizzle/schemas/tasks";
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from "@/drizzle/services/tasks";
import { getUsers } from "@/drizzle/services/users";
import { sanitizeOutput, validator } from "../utils";

const schema = taskSchema.omit({
  id: true,
  actions: true,
  createdBy: true,
  status: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
});

const isPendingTask = (status: string) => {
  return status == "pending" || status == "on hold";
};

const app = new Hono()

  /********************************************************************* */
  /**                             CREATE TASK                            */
  /********************************************************************* */
  .post("/", validator("json", schema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const payload = c.req.valid("json");

    const response = await createTask({
      ...payload,
      actions: ["hold", "progress", "complete", "cancel"],
      status: "pending",
      createdBy: userId,
      updatedBy: userId,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
    });

    //   create task
    return c.json({ success: true, data: response }, 201);
  })

  /********************************************************************* */
  /**                              GET TASKS                             */
  /********************************************************************* */
  .get("/", async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const query = c.req.query();

    const { data, meta } = await getTasks({
      ...query,
      userId,
    });

    const modified = await Promise.all(
      data.map(async (item) => {
        if (item.createdBy?.id === userId) {
          item.actions?.push("delete");
          if (isPendingTask(item.status)) {
            item.actions?.push("edit");
          }
        }

        let sanitized = [] as any;
        if ((item?.users?.length as number) > 0) {
          const { data: users } = await getUsers({
            ids: item.users,
          });

          sanitized = sanitizeOutput(users, [
            "address",
            "createdAt",
            "email",
            "otp",
            "password",
            "phone",
            "role",
            "storeId",
            "updatedAt",
          ]);
        }

        return { ...item, users: sanitized };
      })
    );

    return c.json({ success: true, data: modified, meta }, 200);
  })
  /********************************************************************* */
  /**                              GET TASK                              */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const { id: userId } = c.get("jwtPayload");

    const response = await getTask(id);

    if (!response?.users?.includes(userId) || response?.createdBy !== userId)
      throw new HTTPException(404, { message: "Task not found" });

    if (response?.createdBy === userId) {
      response.actions?.push("delete");
      if (isPendingTask(response.status)) {
        response.actions?.push("edit");
      }
    }
    let sanitized = [] as any;
    if ((response?.users?.length as number) > 0) {
      const { data: users } = await getUsers({
        ids: response.users,
      });

      sanitized = sanitizeOutput(users, [
        "address",
        "createdAt",
        "email",
        "otp",
        "password",
        "phone",
        "role",
        "storeId",
        "updatedAt",
      ]);
    }

    return c.json(
      { success: true, data: { ...response, users: sanitized } },
      200
    );
  })

  /********************************************************************* */
  /**                          UPDATE TASK STATUS                        */
  /********************************************************************* */
  .post("/:id/:action", async (c) => {
    const { id, action } = c.req.param();
    const { id: userId } = c.get("jwtPayload");
    const response = await getTask(id);

    if (!response) throw new HTTPException(404, { message: "Task not found" });

    if (
      response.status === "cancelled" ||
      !response.actions?.includes(action)
    ) {
      throw new HTTPException(404, { message: "Task could not be updated" });
    }

    let payload = {
      status: "",
      actions: [] as string[],
    };

    if (action === "hold") {
      payload = {
        status: "on hold",
        actions: ["progress", "complete", "cancel"],
      };
    }
    if (action === "progress" && response.actions?.includes(action)) {
      payload = {
        status: "in progress",
        actions: ["complete"],
      };
    }
    if (action === "progress" && response.actions?.includes(action)) {
      payload = {
        status: "completed",
        actions: [],
      };
    }
    if (action === "cancel" && response.actions?.includes(action)) {
      payload = {
        status: "cancelled",
        actions: [],
      };
    }

    const result = await updateTask(id, {
      ...payload,
      updatedBy: userId,
    });

    return c.json({ success: true, data: result }, 200);
  })

  /********************************************************************* */
  /**                            UPDATE TASK                            */
  /********************************************************************* */
  .put("/:id", validator("json", schema), async (c) => {
    const { id } = c.req.param();
    const { id: userId } = c.get("jwtPayload");
    const payload = c.req.valid("json");

    const response = await getTask(id);

    if (response?.createdBy !== userId) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    if (!isPendingTask(response.status)) {
      throw new HTTPException(400, { message: "Task could not be updated" });
    }

    const result = await updateTask(id, {
      ...payload,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
      updatedBy: userId,
    });

    return c.json({ success: true, data: result }, 200);
  })

  /********************************************************************* */
  /**                             DELETE TASK                           */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { id } = c.req.param();
    const { id: userId } = c.get("jwtPayload");

    const response = await getTask(id);

    if (response?.createdBy !== userId) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    const result = await deleteTask(id);

    return c.json({ success: true, data: result }, 200);
  });

export default app;
