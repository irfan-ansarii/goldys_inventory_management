import { Hono } from "hono";
import z from "zod";
import { validator as nativeValidator } from "hono/validator";
import {
  DELETE_ROLES,
  formatValue,
  getOrderStatus,
  updateStock,
  validator,
} from "../utils";
import {
  orderCreateSchema,
  shipmentLineItemSchema,
  shipmentSchema,
  transactionCreateSchema,
} from "@/drizzle/schemas/orders";
import { lineItemCreateSchema } from "@/drizzle/schemas/orders";
import {
  createLineItems,
  createOrder,
  createTransactions,
  getLineItems,
  getOrder,
  getOrders,
  updateOrder,
  updateLineItem,
  deleteOrder,
  getTransactions,
  createShipment,
  createShipmentLineItems,
  getShipment,
  getShipmentLineItems,
  getShipments,
  updateShipment,
} from "@/drizzle/services/orders";
import { HTTPException } from "hono/http-exception";
import { createOrderInvoice } from "../invoice";
import { getOption } from "@/drizzle/services/options";
import { del, put } from "@vercel/blob";

export const createSchema = orderCreateSchema
  .omit({
    id: true,
    storeId: true,
    taxLines: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().optional(),
    lineItems: lineItemCreateSchema.array(),
    taxKind: z.object({
      type: z.string(),
      saleType: z.string(),
    }),
    taxLines: z.any(),
    createdAt: z.string().optional(),
  });

const updateSchema = createSchema.extend({
  lineItems: lineItemCreateSchema
    .extend({
      lineItemId: z.number().optional(),
    })
    .array(),
});

const createTransactionSchema = transactionCreateSchema
  .omit({
    id: true,
    storeId: true,
    orderId: true,
    updatedBy: true,
  })
  .array();

export const shipmentCreateSchema = shipmentSchema
  .pick({
    carrier: true,
    awb: true,
    trackingUrl: true,
  })
  .extend({
    lineItems: shipmentLineItemSchema
      .omit({
        id: true,
        shipmentId: true,
      })
      .extend({
        quantity: z
          .string()
          .or(z.number())
          .transform((v) => Number(v)),
      })
      .array(),
  });

export const shipmentUpdateSchema = shipmentSchema.pick({
  carrier: true,
  awb: true,
  trackingUrl: true,
});

const app = new Hono()
  /********************************************************************* */
  /**                            CREATE ORDER                            */
  /********************************************************************* */
  .post("/", validator("json", createSchema), async (c) => {
    const { storeId, id: userId } = c.get("jwtPayload");
    const { lineItems, createdAt, ...rest } = c.req.valid("json");
    const { value } = await getOption("invoice", storeId);
    const jsonOption = JSON.parse(value);

    // organize order data
    rest.tax = formatValue(rest.tax!).toString();
    rest.taxLines = [
      { name: "CGST", amount: formatValue(parseFloat(rest.tax!) / 2) },
      { name: "SGST", amount: formatValue(parseFloat(rest.tax!) / 2) },
    ];

    if (rest.taxKind.saleType === "inter state") {
      rest.taxLines = [{ name: "IGST", amount: formatValue(rest.tax!) }];
    }

    // create order
    let createdOrder = await createOrder({
      ...rest,
      due: rest.total,
      name: rest.name || "",
      paymentStatus: "unpaid",
      storeId,
      taxLines: rest.taxLines,
      createdBy: userId,
      updatedBy: userId,
      createdAt: createdAt ? new Date(createdAt!) : undefined,
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
        orderId: createdOrder.id,
        shippingQuantity: item.requiresShipping ? item.currentQuantity : 0,
      };
    });

    // create line-items
    if (lineItems.length > 0) await createLineItems(modifiedLineItems);

    // update order name and payment status
    let orderName = createdOrder.name;
    if (orderName === "") {
      const paddedId = `${createdOrder.id}`.padStart(4, "0");
      orderName = `${jsonOption.prefix}${paddedId}${jsonOption.suffix}`;
      createdOrder = await updateOrder(createdOrder.id, { name: orderName });
    }

    /**
     * update stock of items which do not require shipping
     * stock of items which require shipping will be updated once they are shipped
     */
    const itemsToAdjust = lineItems
      .filter((item) => !item.requiresShipping)
      .map((item) => ({
        storeId,
        createdBy: userId,
        updatedBy: userId,
        notes: orderName,
        productId: item.productId,
        variantId: item.variantId,
        quantity: -item.currentQuantity!,
        reason: "Sale",
      }));

    await updateStock(storeId, itemsToAdjust);

    return c.json({ data: createdOrder, success: true }, 200);
  })

  /********************************************************************* */
  /**                             GET ORDERS                             */
  /********************************************************************* */
  .get("/", async (c) => {
    const { storeId } = c.get("jwtPayload");
    const query = c.req.query();

    const { data, meta } = await getOrders({ storeId, ...query });

    const resultWithLineItems = await Promise.all(
      data.map(async (order) => {
        const lineItems = await getLineItems(order.id);
        return {
          ...order,
          lineItems,
        };
      })
    );

    return c.json({ data: resultWithLineItems, meta, success: true }, 200);
  })
  /********************************************************************* */
  /**                              GET ORDER                             */
  /********************************************************************* */
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const { storeId } = c.get("jwtPayload");

    const res = await getOrder(id);

    if (res?.storeId !== storeId) {
      throw new HTTPException(404, { message: "Order not found" });
    }

    const lineItems = await getLineItems(res.id);

    const processing = lineItems.filter(
      (item) => item.requiresShipping && item.shippingQuantity! > 0
    );

    const shipments = await getShipments(id);

    const shipmentsWithLineItems = await Promise.all(
      shipments.map(async (shipment) => {
        const lineItems = await getShipmentLineItems(shipment.id);
        return {
          ...shipment,
          lineItems,
        };
      })
    );

    return c.json(
      {
        data: {
          ...res,
          lineItems,
          processing,
          shipments: shipmentsWithLineItems,
        },
        success: true,
      },
      200
    );
  })
  /********************************************************************* */
  /**                            UPDATE ORDER                            */
  /********************************************************************* */
  .put("/:id", validator("json", updateSchema), async (c) => {
    const { id: orderId } = c.req.param();
    const { id: userId, storeId } = c.get("jwtPayload");

    const order = await getOrder(orderId);

    if (!order || order.storeId !== storeId) {
      throw new HTTPException(404, { message: "Order not found" });
    }
    if (order.cancelledAt || order.shipmentStatus !== "processing")
      throw new HTTPException(400, { message: "Order could not be edited" });

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

    const { paymentStatus, due } = await getOrderStatus(
      Number(orderId),
      Number(rest.total)
    );

    // updated order
    const updatedOrder = await updateOrder(orderId, {
      ...rest,
      taxLines: rest.taxLines,
      paymentStatus,
      due,
      updatedBy: userId,
      createdAt: new Date(rest.createdAt!),
    });

    const oldLineItems = await getLineItems(orderId);

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

        const fulfilled = (item.quantity || 0) - (item.shippingQuantity || 0);

        const lineItemData = {
          ...item,
          discount: item.discount || undefined,
          taxLines,
          tax: formatValue(item.tax!),
          orderId: orderId,
          quantity: item.lineItemId ? item.quantity : item.currentQuantity,
          shippingQuantity: item.requiresShipping
            ? item.currentQuantity! - fulfilled
            : 0,
        };

        if (lineItemData.lineItemId) {
          return await updateLineItem(lineItemData.lineItemId, {
            ...lineItemData,
          });
        }

        return await createLineItems(lineItemData);
      })
    );

    // create stock adjustments
    const itemsToAdjust = lineItems
      .filter((item) => !item.requiresShipping)
      .map((item) => {
        const response = oldLineItems.find(
          (res) => res.variantId === item.variantId
        );

        const qty =
          (response?.currentQuantity || 0) - (item.currentQuantity || 0);

        return {
          storeId,
          createdBy: userId,
          updatedBy: userId,
          notes: order.name,
          productId: item.productId,
          variantId: item.variantId,
          quantity: qty,
          reason: qty <= 0 ? "Sale" : "Sale Return",
        };
      });

    await updateStock(storeId, itemsToAdjust);

    return c.json(
      {
        data: { ...updatedOrder, lineItems: lineItemsResponse },
        success: true,
      },
      200
    );
  })
  /********************************************************************* */
  /**                            CANCEL ORDER                            */
  /********************************************************************* */
  .post("/:id/cancel", async (c) => {
    const { id: orderId } = c.req.param();
    const { id: userId, storeId } = c.get("jwtPayload");
    const paylaod = await c.req.json();

    const order = await getOrder(orderId);

    if (order?.storeId !== storeId) {
      throw new HTTPException(404, { message: "Order not found" });
    }
    if (order.cancelledAt || order.shipmentStatus !== "processing")
      throw new HTTPException(400, { message: "Order could not be cancelled" });

    const res = await updateOrder(orderId, {
      cancelledAt: new Date(),
      shipmentStatus: "cancelled",
      cancelReason: paylaod.reason,
      tags: [...order.tags!, "cancelled"],
      updatedBy: userId,
    });

    return c.json({ data: res, success: true }, 200);
  })
  /********************************************************************* */
  /**                            DELETE ORDER                            */
  /********************************************************************* */
  .delete("/:id", async (c) => {
    const { id: orderId } = c.req.param();
    const { storeId, role } = c.get("jwtPayload");

    const order = await getOrder(orderId);

    if (order?.storeId !== storeId) {
      throw new HTTPException(404, { message: "Order not found" });
    }
    if (!DELETE_ROLES.includes(role))
      throw new HTTPException(403, { message: "Permission denied" });

    const res = await deleteOrder(orderId);

    return c.json({ data: res, success: true }, 200);
  })

  /********************************************************************* */
  /**                         GET ORDER INVOICE                          */
  /********************************************************************* */
  .post("/:id/invoice/:action", async (c) => {
    const { id: orderId, action } = c.req.param();
    const { storeId, id: userId } = c.get("jwtPayload");

    const order = await getOrder(orderId);

    if (order.storeId !== storeId) {
      throw new HTTPException(404, { message: "Not found" });
    }

    const lineItems = await getLineItems(order.id);

    // @ts-ignore regenerate invoice to make sure it is updated
    const blob = await createOrderInvoice({ ...order, lineItems });
    const blobResponse = await put(order.name, blob, { access: "public" });

    if (order.invoice) await del(order.invoice);
    await updateOrder(order.id, { invoice: blobResponse.url });

    // TODO implement the ability to send invoice throught email and whatsapp
    if (action === "send") {
      // send invoice to customer via email and whatsapp
      // use limiter to queue the messae
    }

    return c.json({ data: { url: blobResponse.url }, success: true }, 200);
  })

  /********************************************************************* */
  /**                          CREATE TRANSACTION                        */
  /********************************************************************* */
  .post(
    "/:id/transactions",
    validator("json", createTransactionSchema),
    async (c) => {
      const { id: orderId } = c.req.param();
      const { storeId, id: userId } = c.get("jwtPayload");

      const data = c.req.valid("json");

      const order = await getOrder(orderId);

      if (order?.storeId !== storeId)
        throw new HTTPException(404, { message: "Order not found" });

      if (data.length === 0)
        throw new HTTPException(400, {
          message: "Amount must be greater than 0",
        });

      const modifiedTxns = data.map((txn) => ({
        ...txn,
        orderId,
        storeId,
        updatedBy: userId,
        status: "success",
      }));

      const response = await createTransactions(modifiedTxns);

      const { paymentStatus, due } = await getOrderStatus(
        Number(orderId),
        Number(order.total)
      );

      await updateOrder(orderId, {
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
    const { id: orderId } = c.req.param();
    const { storeId } = c.get("jwtPayload");

    const order = await getOrder(orderId);

    if (order.storeId !== storeId)
      throw new HTTPException(404, { message: "Not found" });

    const res = await getTransactions(orderId);

    return c.json({ data: res, success: true }, 200);
  })
  /********************************************************************* */
  /**                        CREATE FORWARD SHIPMENT                     */
  /********************************************************************* */
  .post(
    "/:id/shipments",
    validator("json", shipmentCreateSchema),
    async (c) => {
      const { id: orderId } = c.req.param();
      const { storeId, id: userId } = c.get("jwtPayload");
      const { lineItems, ...payload } = c.req.valid("json");

      const order = await getOrder(orderId);

      if (order?.storeId !== storeId) {
        throw new HTTPException(404, { message: "Order Not found" });
      }

      const orderLineItems = await getLineItems(orderId);

      const orderLineItemsMap = new Map(
        orderLineItems.map((item) => [item.id, item.shippingQuantity!])
      );

      const allItemsExist = lineItems.every((line) => {
        const quantity = orderLineItemsMap.get(line.lineItemId!) as number;
        return line.quantity > 0 && line.quantity <= quantity;
      });

      /** check if all line items are in the order processing */
      if (lineItems.length === 0 || !allItemsExist)
        throw new HTTPException(400, {
          message: "Items cannnot be processed",
        });

      // create shipment
      const shipment = await createShipment({
        ...payload,
        storeId,
        orderId: Number(orderId),
        kind: "forward" as const,
        status: "shipped" as const,
        actions: ["edit", "cancel", "complete", "rto"],
        createdBy: userId,
        updatedBy: userId,
      });

      // update stock
      const itemsToAdjust = lineItems.map((item) => ({
        storeId,
        createdBy: userId,
        updatedBy: userId,
        notes: order.name,
        productId: item.productId,
        variantId: item.variantId,
        quantity: -item.quantity!,
        reason: "sale",
      }));

      await Promise.all([
        // create shipment line items
        createShipmentLineItems(
          lineItems.map((item) => ({
            ...item,
            shipmentId: shipment.id,
            quantity: Number(item.quantity),
          }))
        ),
        // update order
        updateOrder(orderId, {
          shipmentStatus: "shipped",
          tags: [...order.tags!, "shipped"],
        }),
        // update order line items
        ...lineItems.map((line) => {
          const item = orderLineItems.find((ol) => ol.id === line.lineItemId);
          return updateLineItem(item?.id, {
            shippingQuantity: item?.shippingQuantity! - line.quantity!,
          });
        }),
        // update stocks
        updateStock(storeId, itemsToAdjust),
      ]);

      // TODO schedule order shipped message

      return c.json({ data: { ...shipment }, success: true }, 200);
    }
  )
  /********************************************************************* */
  /**                        CREATE RETURN SHIPMENT                      */
  /********************************************************************* */
  .post(
    "/:id/shipments/:shipmentId",
    validator("json", shipmentCreateSchema),
    async (c) => {
      const { id: orderId, shipmentId } = c.req.param();
      const { storeId, id: userId } = c.get("jwtPayload");

      const { lineItems, ...payload } = c.req.valid("json");

      const order = await getOrder(orderId);

      if (order?.storeId !== storeId) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      const shipmentLineItems = await getShipmentLineItems(shipmentId);

      const shipmentLineItemsMap = new Map(
        shipmentLineItems.map((item) => [item.lineItemId, item.quantity])
      );

      /** check if all line items were in the original shipment */
      const allItemsExist = lineItems.every((line) => {
        const quantity = shipmentLineItemsMap.get(line.lineItemId!) as number;
        return line.quantity > 0 && line.quantity <= quantity;
      });

      if (lineItems.length === 0 || !allItemsExist)
        throw new HTTPException(400, { message: "Items cannot be returned" });

      // create shipment
      const shipment = await createShipment({
        ...payload,
        storeId,
        orderId: Number(orderId),
        parentId: Number(shipmentId),
        kind: "return" as const,
        status: "return initiated" as const,
        actions: ["edit", "cancel", "complete"],
        createdBy: userId,
        updatedBy: userId,
      });

      await Promise.all([
        // create shipment line items
        createShipmentLineItems(
          lineItems.map((item) => ({
            ...item,
            shipmentId: shipment.id,
            quantity: Number(item.quantity),
          }))
        ),
        // update current shipment
        updateShipment(shipmentId, {
          actions: [],
          updatedBy: userId,
        }),
        // update order status
        updateOrder(orderId, {
          shipmentStatus: "return initiated",
          tags: [...order.tags!, "return initiated"],
        }),
      ]);

      // TODO scheduel return initiated message
      return c.json({ data: shipment, success: true }, 200);
    }
  )
  /********************************************************************* */
  /**                           UPDATE SHIPMENT                          */
  /********************************************************************* */
  .put(
    "/:id/shipments/:shipmentId/:action",
    // custom validation of param and body data
    nativeValidator("json", (v, c) => {
      const { action } = c.req.param() as Record<string, string>;
      if (action !== "edit") return;

      const parsed = shipmentUpdateSchema.safeParse(v);

      if (!parsed.success) {
        return c.json(
          { success: false, message: "Validation failed", error: parsed.error },
          400
        );
      }

      return parsed.data;
    }),

    async (c) => {
      const { id: orderId, shipmentId, action } = c.req.param();
      const { storeId, id: userId } = c.get("jwtPayload");
      const payload = c.req.valid("json");

      const order = await getOrder(orderId);

      if (order?.storeId !== storeId) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      const shipment = await getShipment(shipmentId);

      if (!shipment || !(shipment?.actions as string[])?.includes(action)) {
        throw new HTTPException(404, {
          message: "Shipment cannot be cancelled",
        });
      }
      // handle edit action
      if (action === "edit") {
        const shipment = await updateShipment(shipmentId, {
          ...payload,
          updatedBy: userId,
        });

        return c.json({ data: shipment, success: true }, 200);
      }

      // handle initiate rto action
      if (action === "rto" && shipment.kind === "forward") {
        const [updatedShipment] = await Promise.all([
          // update shipment
          updateShipment(shipmentId, {
            kind: "rto",
            status: "rto initiated",
            actions: ["edit", "complete"],
            updatedBy: userId,
          }),
          // update order
          updateOrder(orderId, {
            shipmentStatus: "rto initiated",
            tags: [...order.tags!, "rto initiated"],
          }),
        ]);

        return c.json({ data: updatedShipment, success: true }, 200);
      }

      // handle delivered/complete action
      if (shipment.kind === "forward") {
        const [updatedShipment] = await Promise.all([
          // update shipment
          updateShipment(shipmentId, {
            status: "delivered",
            actions: ["return"],
            updatedBy: userId,
          }),
          // update order
          updateOrder(orderId, {
            shipmentStatus: "delivered",
            tags: [...order.tags!, "delivered"],
          }),
        ]);
        // TODO schedule message/email
        return c.json({ data: updatedShipment, success: true }, 200);
      }

      // handle rto and return completation
      const [orderLineItems, shipmentLineItems] = await Promise.all([
        getLineItems(orderId),
        getShipmentLineItems(shipmentId),
      ]);

      const itemsToAdjust = shipmentLineItems.map((item) => ({
        storeId,
        updatedBy: userId,
        notes: order.name,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity!,
        reason: "shipment returned",
      }));

      const [updatedShipment] = await Promise.all([
        // update shipment
        updateShipment(shipmentId, {
          status: shipment.kind === "rto" ? "rto delivered" : "returned",
          actions: [],
          updatedBy: userId,
        }),
        // update order
        updateOrder(orderId, {
          shipmentStatus:
            shipment.kind === "rto" ? "rto delivered" : "returned",
          tags: [
            ...order.tags!,
            shipment.kind === "rto" ? "rto delivered" : "returned",
          ],
        }),
        // update order line items
        ...shipmentLineItems.map((line) => {
          const item = orderLineItems.find((ol) => ol.id === line.lineItemId);
          return updateLineItem(item?.id, {
            shippingQuantity: item?.shippingQuantity! + line.quantity!,
          });
        }),
        // update stocks
        updateStock(storeId, itemsToAdjust),
      ]);

      // TODO if returned create task to issue store credit

      return c.json({ data: updatedShipment, success: true }, 200);
    }
  )
  /********************************************************************* */
  /**                           CANCEL SHIPMENT                          */
  /********************************************************************* */
  .delete("/:id/shipments/:shipmentId", async (c) => {
    const { id: orderId, shipmentId } = c.req.param();
    const { storeId, id: userId } = c.get("jwtPayload");

    const order = await getOrder(orderId);

    if (order?.storeId !== storeId) {
      throw new HTTPException(404, { message: "Order not found" });
    }

    const shipment = await getShipment(shipmentId);

    if (!shipment || !(shipment?.actions as string[])?.includes("cancel")) {
      throw new HTTPException(404, { message: "Shipment cannot be cancelled" });
    }

    // handle return shipment
    if (shipment.kind === "return") {
      const [updatedShipment] = await Promise.all([
        // update shipment
        updateShipment(shipmentId, { status: "cancelled" }),
        // update parenr shipment
        updateShipment(shipment.parentId, { actions: ["return"] }),
        // update order
        updateOrder(orderId, {
          shipmentStatus: "delivered",
          tags: [...order.tags!, "return cancelled"],
        }),
      ]);
      return c.json({ data: updatedShipment, success: true }, 200);
    }

    const [orderLineItems, shipmentLineItems] = await Promise.all([
      getLineItems(orderId),
      getShipmentLineItems(shipmentId),
    ]);

    const itemsToAdjust = shipmentLineItems.map((item) => ({
      storeId,
      createdBy: userId,
      updatedBy: userId,
      notes: order.name,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity!,
      reason: "shipment cancelled",
    }));

    await Promise.all([
      // update shipemnt
      updateShipment(shipmentId, { status: "cancelled" }),
      // update order
      updateOrder(orderId, {
        shipmentStatus: "processing",
        tags: [...order.tags!, "shipment cancelled"],
      }),
      // update line items
      ...shipmentLineItems.map((line) => {
        const item = orderLineItems.find((ol) => ol.id === line.lineItemId);
        return updateLineItem(item?.id, {
          shippingQuantity: item?.shippingQuantity! + line.quantity!,
        });
      }),
      // update stocks
      updateStock(storeId, itemsToAdjust),
    ]);

    return c.json({ data: "res", success: true }, 200);
  });

export default app;
