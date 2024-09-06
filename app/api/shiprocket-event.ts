import {
  getOrder,
  getShipments,
  updateOrder,
  updateShipment,
} from "@/drizzle/services/orders";

interface Props {
  storeId: number;
  payload: Record<string, any>;
}
export const handleShiprocketEvent = async ({ storeId, payload }: Props) => {
  const order = await getOrder(undefined, {
    name: payload.channel_order_id,
    storeId: storeId,
  });

  if (!order) return new Promise((res) => res(true));

  const { current_status: status, courier_name: carrier, awb } = payload;

  const shipments = await getShipments(order.id);

  const shipmentToBeUpdated = shipments.find((sh) => sh.awb === awb);

  // if shipment is already created

  if (shipmentToBeUpdated) {
    const mappedStatus = mapStatus(status);
    return await Promise.all([
      updateShipment(shipmentToBeUpdated.id, {
        status: mappedStatus,
      }),
      updateOrder(order.id, {
        shipmentStatus: mappedStatus,
      }),
    ]);
  }

  // create shipment

  return await new Promise((res) => res(true));
};

const mapStatus = (status: string) => {
  return status;
};
