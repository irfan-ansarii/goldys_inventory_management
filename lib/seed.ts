import lines from "@/line.json";
import orders from "@/order.json";

import { createLineItems, createOrder } from "@/drizzle/services/orders";
import { parseISO, parse, formatISO } from "date-fns";

export const seedCustomer = async () => {
  await Promise.all(
    orders.map(async (order) => {
      // Ensure the date format is valid before parsing
      const parsedDate = parse(order.createdAt, "dd-MM-yyyy HH:mm", new Date());

      // Format parsed date into ISO 8601 format
      const isoDate = formatISO(parsedDate);

      // Create the order with the ISO 8601 formatted date
      const created = await createOrder({
        ...order,
        storeId: 8,
        createdAt: isoDate, // No need to re-parse ISO date, use formatted date directly
        id: undefined, // Ensure no id is passed when creating the order
      });

      // Filter line items related to the current order
      const filtered = lines.filter((l) => l.invoiceId === order.id);

      // Log the created order id for debugging
      console.log("created::", created.id);

      // Create line items associated with the order
      const line = await createLineItems(
        filtered.map((f) => ({
          ...f,
          orderId: created.id,
          title: `Item ${created.id}`, // Custom title for each line item
        }))
      );
    })
  );
};
