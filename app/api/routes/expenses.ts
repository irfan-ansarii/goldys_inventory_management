import { Hono } from "hono";
import { expenseCreateSchema } from "@/drizzle/schemas/expenses";
import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from "@/drizzle/services/expenses";
import { HTTPException } from "hono/http-exception";
import { validator } from "../utils";

const app = new Hono()
  /********************************************************************* */
  /**                           CREATE EXPENSE                           */
  /********************************************************************* */
  .post("/", validator("json", expenseCreateSchema), async (c) => {
    const { id, storeId } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const result = await createExpense({
      ...data,
      storeId,
      createdBy: id,
      updatedBy: id,
    });

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  })

  /********************************************************************* */
  /**                            GET EXPENSES                            */
  /********************************************************************* */
  .get("/", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const query = c.req.query();

    const results = await getExpenses({
      ...query,
      storeId,
    });

    return c.json({
      success: true,
      ...results,
    });
  })

  /********************************************************************* */
  /**                            GET EXPENSE                             */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const { storeId } = c.get("jwtPayload");

    const result = await getExpense(id);

    if (!result || result.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    return c.json({
      success: true,
      data: result,
    });
  })
  /********************************************************************* */
  /**                           UPDATE EXPENSE                           */
  /********************************************************************* */
  .put("/:id", validator("json", expenseCreateSchema), async (c) => {
    const { id } = c.req.param();
    const { storeId, role, id: userId } = c.get("jwtPayload");
    const data = c.req.valid("json");
    const result = await getExpense(id);

    if (!result || result.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    if (role !== "admin" && result.createdBy !== userId)
      throw new HTTPException(403, { message: "Forbidden" });

    const response = await updateExpense(id, {
      ...data,
      updatedBy: userId,
    });

    return c.json({
      success: true,
      data: response,
    });
  })
  /********************************************************************* */
  /**                           DELETE EXPENSE                           */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { id } = c.req.param();
    const { storeId, role, id: userId } = c.get("jwtPayload");

    const result = await getExpense(id);

    if (!result || result.storeId !== storeId)
      throw new HTTPException(404, { message: "Not Found" });

    if (role !== "admin" && result.createdBy !== userId)
      throw new HTTPException(403, { message: "Forbidden" });

    const response = await deleteExpense(id);

    return c.json({
      success: true,
      data: response,
    });
  });

export default app;
