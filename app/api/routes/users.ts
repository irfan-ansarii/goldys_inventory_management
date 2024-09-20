import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { userCreateSchema } from "@/drizzle/schemas/users";
import {
  createUser,
  deleteUser,
  getSession,
  getUser,
  getUsers,
  updateUser,
} from "@/drizzle/services/users";
import { HTTPException } from "hono/http-exception";

const userSchema = userCreateSchema
  .pick({
    storeId: true,
    name: true,
    phone: true,
    email: true,
    role: true,
  })
  .extend({
    address: z
      .object({
        address: z.string(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
        gstin: z.string(),
      })
      .optional(),
  });

const app = new Hono()
  /********************************************************************* */
  /**                             CREATE USER                            */
  /********************************************************************* */
  .post("/", zValidator("json", userSchema), async (c) => {
    const { role, storeId } = c.get("jwtPayload");

    const { address, ...rest } = c.req.valid("json");

    const user = await getUser(undefined, {
      email: rest.email,
      phone: rest.phone,
    });

    if (user) {
      const message =
        user.phone === rest.phone
          ? "Phone already registered"
          : "Email already registered";
      throw new HTTPException(400, { message });
    }
    if (role !== "admin" && rest.role === "admin")
      throw new HTTPException(400, { message: "Could not create admin user" });

    const result = await createUser({
      ...rest,
      address: address?.address ? address : undefined,
      storeId,
    });

    return c.json({
      success: true,
      data: result,
    });
  })
  /********************************************************************* */
  /**                              GET USERS                             */
  /********************************************************************* */
  .get("/", async (c) => {
    const { roles } = c.req.queries();
    const { q } = c.req.query();

    const results = await getUsers({
      roles,
      q,
    });

    return c.json({
      success: true,
      ...results,
    });
  })
  /********************************************************************* */
  /**                               GET ME                               */
  /********************************************************************* */
  .get("/me", async (c) => {
    const { id, storeId } = c.get("jwtPayload");

    const session = await getSession(id);

    return c.json({
      data: session,
      success: true,
    });
  })

  /********************************************************************* */
  /**                              GET USER                              */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { id } = c.req.param();

    const user = await getUser(id);
    if (!user) throw new HTTPException(404, { message: "Not Found" });

    return c.json({
      success: true,
      data: user,
    });
  })
  /********************************************************************* */
  /**                            UPDATE USER                             */
  /********************************************************************* */
  .put("/:id", zValidator("json", userSchema), async (c) => {
    const { id } = c.req.param();
    const { role } = c.get("jwtPayload");
    const { address, ...rest } = c.req.valid("json");
    const user = await getUser(id);

    if (!user) throw new HTTPException(404, { message: "User not Found" });

    const isForbidden =
      rest.role !== "customer" && rest.role !== "supplier" && role !== "admin";

    if (isForbidden)
      throw new HTTPException(403, { message: "Permisson denied" });

    const result = await updateUser(id, {
      ...rest,
      address: address?.address ? address : undefined,
    });

    return c.json({
      success: true,
      data: result,
    });
  })
  /********************************************************************* */
  /**                            DELETE USER                             */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { id } = c.req.param();
    const { role, id: userId } = c.get("jwtPayload");

    const user = await getUser(id);

    if (!user) throw new HTTPException(404, { message: "User not Found" });

    if (role !== "admin")
      throw new HTTPException(403, { message: "Permission denied" });

    const result = await deleteUser(id);

    return c.json({
      success: true,
      data: result,
    });
  });
export default app;
