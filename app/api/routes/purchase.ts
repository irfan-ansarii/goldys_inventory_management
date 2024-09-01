import { Hono } from "hono";
import z from "zod";
import {
  formatValue,
  getOrderStatus,
  getPurchaseStatus,
  updateStock,
  validator,
} from "../utils";

import { HTTPException } from "hono/http-exception";

import {
  purchaseCreateSchema,
  purchaseLineItemCreateSchema,
  purchaseTransactionCreateSchema,
} from "@/drizzle/schemas/purchase";
import {
  createPurchase,
  createPurchaseLineItems,
  createPurchaseTransactions,
  deletePurchase,
  getPurchase,
  getPurchaseLineItems,
  getPurchases,
  getPurchaseTransactions,
  updatePurchase,
  updatePurchaseLineItem,
} from "@/drizzle/services/purchase";
import { getStore } from "@/drizzle/services/stores";

export const createSchema = purchaseCreateSchema
  .omit({
    id: true,
    storeId: true,
    taxLines: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    lineItems: purchaseLineItemCreateSchema.array(),
    taxKind: z.object({
      type: z.string(),
      saleType: z.string(),
    }),
    taxLines: z.any(),
    createdAt: z.string().optional(),
  });

const updateSchema = createSchema.extend({
  lineItems: purchaseLineItemCreateSchema
    .extend({
      lineItemId: z.number().optional(),
    })
    .array(),
});

const createTransactionSchema = purchaseTransactionCreateSchema
  .omit({
    id: true,
    storeId: true,
    purchaseId: true,
    updatedBy: true,
  })
  .array();

const app = new Hono()
  /********************************************************************* */
  /**                          CREATE PURCHASE                           */
  /********************************************************************* */
  .post("/", validator("json", createSchema), async (c) => {
    const { storeId, id: userId } = c.get("jwtPayload");

    const { lineItems, createdAt, ...rest } = c.req.valid("json");

    // organize purchase data
    rest.tax = formatValue(rest.tax!).toString();
    rest.taxLines = [
      { name: "CGST", amount: formatValue(parseFloat(rest.tax!) / 2) },
      { name: "SGST", amount: formatValue(parseFloat(rest.tax!) / 2) },
    ];

    if (rest.taxKind.saleType === "inter state") {
      rest.taxLines = [{ name: "IGST", amount: formatValue(rest.tax!) }];
    }

    // create purchase
    let createdPurchase = await createPurchase({
      ...rest,
      due: rest.total,
      name: rest.name,
      paymentStatus: "unpaid",
      storeId,
      taxLines: rest.taxLines,
      createdBy: userId,
      updatedBy: userId,
      createdAt: createdAt,
    });

    // organize line-items data
    const modifiedLineItems = lineItems.map((item) => {
      let taxLines = [
        { name: "CGST", amount: formatValue(parseFloat(item.tax!) / 2) },
        { name: "SGST", amount: formatValue(parseFloat(item.tax!) / 2) },
      ];
      if (rest.taxKind.saleType === "inter state") {
        taxLines = [{ name: "IGST", amount: formatValue(item.tax!) }];
      }

      return {
        ...item,
        discount: item.discount || undefined,
        taxLines,
        tax: formatValue(item.tax!),
        storeId,
        quantity: item.currentQuantity,
        purchaseId: createdPurchase.id,
      };
    });

    // create stock adjustments
    const itemsToAdjust = lineItems.map((item) => ({
      storeId,
      createdBy: userId,
      updatedBy: userId,
      notes: rest.name,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.currentQuantity!,
      reason: "Purchase",
    }));

    updateStock(storeId, itemsToAdjust);

    // create line-items
    if (lineItems.length > 0) await createPurchaseLineItems(modifiedLineItems);

    return c.json({ data: createdPurchase, success: true }, 200);
  })

  /********************************************************************* */
  /**                           GET PURCHASES                            */
  /********************************************************************* */
  .get("/", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const query = c.req.query();

    const { data, meta } = await getPurchases({ storeId, ...query });

    const resultWithLineItems = await Promise.all(
      data.map(async (purchase) => {
        const lineItems = await getPurchaseLineItems(purchase.id);
        return {
          ...purchase,
          lineItems,
        };
      })
    );

    return c.json({ data: resultWithLineItems, meta, success: true }, 200);
  })
  /********************************************************************* */
  /**                             GET PURCHASE                           */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const { storeId } = c.get("jwtPayload");

    const res = await getPurchase(id);

    if (!res || res.storeId !== storeId) {
      throw new HTTPException(404, { message: "Not found" });
    }

    const lineItems = await getPurchaseLineItems(res.id);

    return c.json({ data: { ...res, lineItems }, success: true }, 200);
  })
  /********************************************************************* */
  /**                          UPDATE PURCHASE                           */
  /********************************************************************* */
  .put("/:id", validator("json", updateSchema), async (c) => {
    const { id: purchaseId } = c.req.param();
    const { id: userId, storeId } = c.get("jwtPayload");

    const purchase = await getPurchase(purchaseId);

    if (!purchase || purchase.storeId !== storeId) {
      throw new HTTPException(404, {
        message: "Not found",
      });
    }

    const { lineItems, ...rest } = c.req.valid("json");

    // organize order data
    rest.tax = formatValue(rest.tax!).toString();

    rest.taxLines = [
      { name: "CGST", amount: formatValue(parseFloat(rest.tax!) / 2) },
      { name: "SGST", amount: formatValue(parseFloat(rest.tax!) / 2) },
    ];

    if (rest.taxKind.saleType === "inter state") {
      rest.taxLines = [{ name: "IGST", amount: formatValue(rest.tax!) }];
    }

    const { paymentStatus, due } = await getPurchaseStatus(
      Number(purchaseId),
      Number(rest.total)
    );

    // updated order
    const updatedPurchase = await updatePurchase(purchaseId, {
      ...rest,
      taxLines: rest.taxLines,
      paymentStatus,
      due,
      updatedBy: userId,
      createdAt: new Date(rest.createdAt!),
    });

    const oldLineItems = await getPurchaseLineItems(purchaseId);

    // create or update line items
    const lineItemsResponse = await Promise.all(
      lineItems.map(async (item) => {
        let taxLines = [
          { name: "CGST", amount: formatValue(parseFloat(item.tax!) / 2) },
          { name: "SGST", amount: formatValue(parseFloat(item.tax!) / 2) },
        ];

        if (rest.taxKind.saleType === "inter state") {
          taxLines = [{ name: "IGST", amount: formatValue(item.tax!) }];
        }

        const lineItemData = {
          ...item,
          discount: item.discount || undefined,
          taxLines,
          tax: formatValue(item.tax!),
          purchaseId: purchaseId,
          quantity: item.lineItemId ? item.quantity : item.currentQuantity,
        };

        if (lineItemData.lineItemId) {
          return await updatePurchaseLineItem(lineItemData.lineItemId, {
            ...lineItemData,
          });
        }

        return await createPurchaseLineItems(lineItemData);
      })
    );

    // create stock adjustments
    const itemsToAdjust = lineItems.map((item) => {
      const response = oldLineItems.find(
        (res) => res.variantId === item.variantId
      );

      const qty =
        (item.currentQuantity || 0) - (response?.currentQuantity || 0);

      return {
        storeId,
        createdBy: userId,
        updatedBy: userId,
        notes: purchase.name,
        productId: item.productId,
        variantId: item.variantId,
        quantity: qty,
        reason: qty <= 0 ? "Purchase" : "Purchase Return",
      };
    });

    updateStock(storeId, itemsToAdjust);

    return c.json(
      {
        data: { ...updatedPurchase, lineItems: lineItemsResponse },
        success: true,
      },
      200
    );
  })
  /********************************************************************* */
  /**                          DELETE PURCHASE                           */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { id: purchaseId } = c.req.param();
    const { id: userId, storeId } = c.get("jwtPayload");

    const purchase = await getPurchase(purchaseId);

    if (!purchase || purchase.storeId !== storeId) {
      throw new HTTPException(404, {
        message: "Not found",
      });
    }
    const res = await deletePurchase(purchaseId);

    return c.json({ data: res, success: true }, 200);
  })

  /********************************************************************* */
  /**                       GET PURCHASE INVOICE                         */
  /********************************************************************* */
  .get("/:id/invoice", async (c) => {
    const { id: purchaseId } = c.req.param();
    const { storeId, id: userId } = c.get("jwtPayload");

    const purchase = await getPurchase(purchaseId);

    if (purchase.storeId !== storeId) {
      throw new HTTPException(404, {
        message: "Not found",
      });
    }

    // regenerate invoice to make sure it is updated

    return c.json({ data: { url: "invoice url" }, success: true }, 200);
  })

  /********************************************************************* */
  /**                          CREATE TRANSACTION                        */
  /********************************************************************* */
  .post(
    "/:id/transactions",
    validator("json", createTransactionSchema),
    async (c) => {
      const { id: purchaseId } = c.req.param();
      const { storeId, id: userId } = c.get("jwtPayload");

      const data = c.req.valid("json");

      const purchase = await getPurchase(purchaseId);

      if (purchase.storeId !== storeId) {
        throw new HTTPException(404, {
          message: "Not found",
        });
      }

      const modifiedTxns = data.map((txn) => ({
        ...txn,
        purchaseId,
        storeId,
        updatedBy: userId,
        status: "success",
      }));

      const response = await createPurchaseTransactions(modifiedTxns);

      const { paymentStatus, due } = await getPurchaseStatus(
        Number(purchaseId),
        Number(purchase.total)
      );

      await updatePurchase(purchaseId, {
        paymentStatus,
        due,
      });

      return c.json({ data: response, success: true }, 200);
    }
  )

  /********************************************************************* */
  /**                           GET TRANSACTIONS                         */
  /********************************************************************* */
  .get("/:id/transactions", async (c) => {
    const { id: purchaseId } = c.req.param();
    const { storeId } = c.get("jwtPayload");

    const purchase = await getPurchase(purchaseId);

    if (purchase.storeId !== storeId) {
      throw new HTTPException(404, {
        message: "Not found",
      });
    }

    const response = await getPurchaseTransactions(purchaseId);

    return c.json({ data: response, success: true }, 200);
  });

export default app;
