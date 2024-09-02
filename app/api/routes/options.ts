import { Hono } from "hono";
import z from "zod";
import { DELETE_ROLES, validator } from "../utils";

import {
  deleteOption,
  getOption,
  getOptions,
  upsertOption,
} from "@/drizzle/services/options";
import { HTTPException } from "hono/http-exception";

const schema = z.any();
const app = new Hono()

  /********************************************************************* */
  /**                             GET OPTIONS                            */
  /********************************************************************* */
  .get("/", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const response = await getOptions(storeId);
    return c.json({ data: response, success: true }, 200);
  })
  /********************************************************************* */
  /**                             GET OPTION                             */
  /********************************************************************* */
  .get("/:key", async (c) => {
    const key = c.req.param("key");

    const { storeId } = c.get("jwtPayload");
    const response = await getOption(key, storeId);

    if (!response) {
      throw new HTTPException(404, { message: "Not Found" });
    }

    const json = JSON.parse(response.value);

    return c.json({ data: json, success: true }, 200);
  })
  /********************************************************************* */
  /**                            UPDATE OPTION                            */
  /********************************************************************* */
  .put("/:key", validator("json", schema), async (c) => {
    const { id: userId, storeId } = c.get("jwtPayload");
    const { key } = c.req.param();
    const value = c.req.valid("json");

    const stringValue = JSON.stringify(value);

    const response = await upsertOption({
      key,
      value: stringValue,
      storeId,
      createdBy: userId,
      updatedBy: userId,
    });

    return c.json({ data: response, success: true }, 200);
  })
  /********************************************************************* */
  /**                            DELETE OPTION                            */
  /********************************************************************* */
  .delete("/:key", async (c) => {
    const key = c.req.param("key");
    const { role, storeId } = c.get("jwtPayload");
    let response = await getOption(key, storeId);

    if (!response) {
      throw new HTTPException(404, { message: "Config not found" });
    }

    if (!DELETE_ROLES.includes(role)) {
      throw new HTTPException(403, { message: "Permisson denied" });
    }

    response = await deleteOption(key);

    return c.json({ data: response, success: true }, 200);
  });

export default app;
