import {
  createShipment,
  createShipmentLineItems,
  getLineItems,
  getOrder,
  getShipmentByAWB,
  getShipments,
  updateLineItem,
  updateOrder,
  updateShipment,
} from "@/drizzle/services/orders";
import { updateStock } from "./utils";

interface Props {
  storeId: number;
  payload: Record<string, any>;
}
export const handleShiprocketEvent = async ({ storeId, payload }: Props) => {
  const {
    order_id,
    current_status: status,
    courier_name: carrier,
    awb,
  } = payload;

  const shipment = await getShipmentByAWB(awb);

  const mappedStatus = mapStatus(status?.toLowerCase(), shipment.kind || "");

  // if there is shipment with awb then update and return
  if (shipment) {
    return await Promise.all([
      updateShipment(shipment.id, { status: mappedStatus }),
      updateOrder(shipment.orderId, { status: mappedStatus }),
    ]);
  }

  // incase the shipment is not created then create shipment and update its tracking
  const order = await getOrder(undefined, { name: order_id, storeId: storeId });
  const orderLineItems = await getLineItems(order.id);
  const lineItems = orderLineItems.filter(
    (item) => item.requiresShipping && item.shippingQuantity! > 0
  );

  if (!order || lineItems.length === 0) {
    console.warn("Order/pending line-items not found skipping...");
    return new Promise((res) => res(true));
  }

  const shipments = await getShipments(order.id);

  if (shipments?.length > 0) {
    console.warn("Too many shipments skipping...");
    return new Promise((res) => res(true));
  }

  // create shipment
  const createdShipment = await createShipment({
    storeId,
    orderId: Number(order.id),
    carrier,
    awb,
    trackingUrl: `https://goldysnestt.shiprocket.co/tracking/${awb}`,
    kind: "forward" as const,
    status: "shipped" as const,
    actions: ["edit", "cancel", "complete", "rto"],
  });

  // inventory to be updated
  const itemsToAdjust = lineItems.map((item) => ({
    storeId,
    notes: order.name,
    productId: item.productId,
    variantId: item.variantId,
    quantity: -item.shippingQuantity!,
    reason: "sale",
  }));

  await Promise.all([
    // create shipment line items
    createShipmentLineItems(
      lineItems.map((item) => ({
        ...item,
        shipmentId: createdShipment.id,
        quantity: Number(item.shippingQuantity),
      }))
    ),

    // update order
    updateOrder(order.id, {
      shipmentStatus: "shipped",
      tags: [...order.tags!, "shipped"],
    }),

    // update order line items
    ...lineItems.map((line) =>
      updateLineItem(line.id, { shippingQuantity: 0 })
    ),

    // update stocks
    updateStock(storeId, itemsToAdjust),
  ]);

  return await new Promise((res) => res(true));
};

const mapStatus = (status: string, kind: string) => {
  switch (status) {
    case "pickup booked":
    case "pickup generated":
    case "out for pickup":
    case "in transit":
    case "picked up":
    case "shipped":
    case "reached at destication hub":
    case "out for delivery":
    case "undelivered":
      return kind === "return" ? "return initiated" : "shipped";
    case "delivered":
      return "delivered";
    case "rto initiated":
    case "rto in transit":
    case "rto_ofd":
      return "rto initiated";
  }
  return status;
};
