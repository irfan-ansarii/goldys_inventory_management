import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { storeCreateSchema as storeSchema } from "@/drizzle/schemas";

import {
  createStore,
  deleteStore,
  getStore,
  getStores,
  updateStore,
} from "@/drizzle/services/stores";
import { sign } from "hono/jwt";
import { updateUser } from "@/drizzle/services/users";

const storeCreateSchema = storeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const app = new Hono()

  /********************************************************************* */
  /**                             CREATE STORE                           */
  /********************************************************************* */
  .post("/", zValidator("json", storeCreateSchema), async (c) => {
    const data = c.req.valid("json");
    const { role } = c.get("jwtPayload");

    if (role !== "admin")
      throw new HTTPException(403, { message: "Permisson denied" });

    const store = await createStore(data);

    // TODO create options and inventories
    return c.json({ success: true, data: store }, 201);
  })

  /********************************************************************* */
  /**                              GET STORES                            */
  /********************************************************************* */
  .get("/", async (c) => {
    const { data, meta } = await getStores();

    return c.json({ success: true, data, meta }, 200);
  })

  /********************************************************************* */
  /**                             SWITCH STORE                           */
  /********************************************************************* */
  .post("/:id", async (c) => {
    const { id } = c.req.param();
    const { id: userId, role } = c.get("jwtPayload");

    if (role !== "admin")
      throw new HTTPException(403, { message: "Permission denied" });

    const response = await getStore(id);

    if (!response) throw new HTTPException(404, { message: "Store not found" });

    await updateUser(userId, { storeId: id });

    const payload = {
      id: userId,
      storeId: id,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7 /** 7 days */,
    };

    const token = await sign(payload, "secret");

    return c.json(
      {
        success: true,
        data: {
          ...response,
          token,
        },
      },
      201
    );
  })
  /********************************************************************* */
  /**                              GET STORE                             */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const { role } = c.get("jwtPayload");

    if (role !== "admin")
      throw new HTTPException(403, { message: "Forbidden" });

    const result = await getStore(id);

    return c.json({ success: true, data: result }, 200);
  })

  /********************************************************************* */
  /**                            UPDATE STORE                            */
  /********************************************************************* */
  .put("/:id", zValidator("json", storeCreateSchema), async (c) => {
    const { id } = c.req.param();
    const { role } = c.get("jwtPayload");
    const data = c.req.valid("json");
    const { token } = data;

    const store = await getStore(id);

    // channel access token
    let tempToken = store.token;
    if (!token?.startsWith("•") && token?.length! > 10) {
      tempToken = token!;
    }

    if (role !== "admin")
      throw new HTTPException(403, { message: "Permission denied" });

    const result = await updateStore(id, { ...data, token: tempToken });

    return c.json({ success: true, data: result }, 200);
  })

  /********************************************************************* */
  /**                             DELETE STORE                           */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { id } = c.req.param();
    const { role, storeId } = c.get("jwtPayload");

    if (role !== "admin" || Number(id) === Number(storeId))
      throw new HTTPException(403, { message: "Forbidden" });

    const result = await deleteStore(id);

    return c.json({ success: true, data: result }, 200);
  });

export default app;
