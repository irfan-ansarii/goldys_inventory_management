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
import { sanitizeOutput } from "../utils";

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

    const sanitized = sanitizeOutput(result, ["password", "otp"]);
    return c.json({
      success: true,
      data: sanitized,
    });
  })
  /********************************************************************* */
  /**                              GET USERS                             */
  /********************************************************************* */
  .get("/", async (c) => {
    const { roles } = c.req.queries();
    const query = c.req.query();

    const { data, meta } = await getUsers({
      roles,
      ...query,
    });

    const sanitized = sanitizeOutput(data, ["password", "otp"]);
    return c.json({
      success: true,
      data: sanitized,
      meta,
    });
  })
  /********************************************************************* */
  /**                               GET ME                               */
  /********************************************************************* */
  .get("/me", async (c) => {
    const { id } = c.get("jwtPayload");

    const { store, ...rest } = await getSession(id);

    const sanitizedUser = sanitizeOutput(rest, ["password", "otp"]);
    const sanitizedStore = sanitizeOutput(store!, ["domain", "token"]);

    return c.json({
      data: { ...sanitizedUser, ...sanitizedStore },
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

    const sanitized = sanitizeOutput(user, ["password", "otp"]);

    return c.json({
      success: true,
      data: sanitized,
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

    const sanitized = sanitizeOutput(result, ["password", "otp"]);

    return c.json({
      success: true,
      data: sanitized,
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

    const sanitized = sanitizeOutput(result, ["password", "otp"]);

    return c.json({
      success: true,
      data: sanitized,
    });
  });
export default app;
