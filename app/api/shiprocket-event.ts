import {
  getOrder,
  getShipmentByAWB,
  updateOrder,
  updateShipment,
} from "@/drizzle/services/orders";

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

  // if there is shipment with awb then update it and return
  if (shipment) {
    return await Promise.all([
      updateShipment(shipment.id, { status: mapStatus(status) }),
      updateOrder(shipment.orderId, { status: mapStatus(status) }),
    ]);
  }

  const order = await getOrder(undefined, { name: order_id, storeId: storeId });

  if (!order) return new Promise((res) => res(true));

  // if shipment is not already created
  // create shipment

  // const mappedStatus = mapStatus(status);
  // return await Promise.all([
  //   updateShipment(shipmentToBeUpdated.id, {
  //     status: mappedStatus,
  //   }),
  //   updateOrder(order.id, {
  //     shipmentStatus: mappedStatus,
  //   }),
  // ]);

  // create shipment

  return await new Promise((res) => res(true));
};

const mapStatus = (status: string) => {
  return status;
};
