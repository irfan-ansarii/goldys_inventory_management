import { getOrder } from "@/drizzle/services/orders";
import { getStore } from "@/drizzle/services/stores";
import { createAdminRestApiClient } from "@shopify/admin-api-client";

export const fulfill = async ({ orderId, storeId, shipment }: any) => {
  const store = await getStore(storeId);
  const order = await getOrder(orderId);

  const client = createAdminRestApiClient({
    storeDomain: store.domain!,
    apiVersion: "2024-07",
    accessToken: store.token!,
  });

  const channelOrderId = (order.additionalMeta as Record<string, any>)?.id;
  const fulfillmentOrders = await fetchFulfillmentOrders(
    client,
    channelOrderId
  );

  const filtered = fulfillmentOrders.filter((f) =>
    f.supported_actions.includes("create_fulfillment")
  );

  // TODO if no fulfillment orders to create then fetch fulfillment and create ovent on that
  const fulfillments = await processFulfillments(client, filtered, shipment);

  return await createEvent(client, fulfillments);
};

/**
 * fetch all fulfillment orders
 * @param client
 * @param orderId
 * @returns
 */
async function fetchFulfillmentOrders(client: any, orderId: string) {
  try {
    const res = await client.get(`orders/${orderId}/fulfillment_orders`, {
      retries: 2,
    });

    if (res.ok) {
      const data = (await res.json()) as {
        fulfillment_orders: Record<string, any>[];
      };
      return data.fulfillment_orders;
    } else {
      return [];
    }
  } catch (error) {
    console.log("Error while fetching the fulfillment order skipping...");
    return [];
  }
}

/**
 * create fulfillment on shopify
 * @param client
 * @param fulfillments
 * @param shipment
 * @returns
 */
async function processFulfillments(
  client: any,
  fulfillmentOrders: Record<string, any>[],
  shipment: Record<string, any>
) {
  const tracking = {
    company: shipment.carrier,
    number: shipment.awb,
    url: shipment.trackingUrl,
  };

  return await Promise.all(
    fulfillmentOrders.map(async (f) => {
      const items = f.line_items.map((line: any) => ({
        id: line.id,
        quantity: line.fulfillable_quantity,
      }));

      try {
        const response = await client.post(
          `fulfillments`,
          {
            data: {
              fulfillment: {
                line_items_by_fulfillment_order: [
                  {
                    fulfillment_order_id: f.id,
                    fulfillment_order_line_items: items,
                  },
                ],
                tracking_info: {
                  ...tracking,
                },
                notify_customer: true,
              },
            },
          },
          { retries: 2 }
        );
        if (response.ok) {
          const json = await response.json();
          return json.fulfillment;
        } else {
          return {};
        }
      } catch (error) {
        console.log("Error while fulfilling shopify order skipping...");
        return {};
      }
    })
  );
}

/**
 * create shopify fulfillment events
 * @param client
 * @param fulfillments
 * @param orderId
 * @returns
 */
const createEvent = async (
  client: any,
  fulfillments: Record<string, any>[]
) => {
  const results = await Promise.all(
    fulfillments.map(async (f) => {
      try {
        const response = await client.post(
          `orders/${f.order_id}/fulfillments/${f.id}/events.json`,
          {
            data: {
              event: {
                status: "in_transit",
              },
            },
          },
          { retries: 2 }
        );
        if (response.ok) {
          const json = await response.json();
          return json.fulfillment_event;
        } else {
          return {};
        }
      } catch (error) {
        console.log("Error while creating event skipping...", error);
        return {};
      }
    })
  );

  return results;
};
