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

  console.log("fetching fulfill order...");

  const fulfillments = await fetchFulfillments(
    client,
    (order.additionalMeta as Record<string, any>)?.id
  );

  const filtered = fulfillments.filter((f) =>
    f.supported_actions.includes("create_fulfillment")
  );

  console.log("fullfillments:::", fulfillments);

  const response = await processFulfillments(client, filtered, shipment);

  console.log("created fulfill...");
  return response;
};

/**
 * fetch all fulfillment orders
 * @param client
 * @param orderId
 * @returns
 */
async function fetchFulfillments(client: any, orderId: string) {
  let success = false;
  let fulfillments: Record<string, any>[] = [];
  let attempts = 0;

  while (attempts < 3 && !success) {
    try {
      const res = await client.get(`orders/${orderId}/fulfillment_orders`);

      if (res.ok) {
        const data = (await res.json()) as {
          fulfillments: Record<string, any>[];
        };
        fulfillments = data.fulfillments;
        success = true;
      }
    } catch (error) {
      attempts++;
      if (attempts < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  if (!success) return [];

  return fulfillments;
}

/**
 * craete fulfillment on shopify
 * @param client
 * @param fulfillments
 * @param shipment
 * @returns
 */
async function processFulfillments(
  client: any,
  fulfillments: Record<string, any>[],
  shipment: Record<string, any>
) {
  const tracking = {
    company: shipment.carrier,
    number: shipment.awb,
    url: shipment.trackingUrl,
  };

  const results = await Promise.all(
    fulfillments.map(async (f) => {
      const items = f.line_items.map((l: any) => l.id);

      let attempts = 0;
      let success = false;
      let result;

      while (attempts < 3 && !success) {
        try {
          result = client.post(`fulfillments`, {
            data: {
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
          });
          success = true;
        } catch (error) {
          attempts++;
          if (attempts < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
      return result;
    })
  );

  return results;
}
