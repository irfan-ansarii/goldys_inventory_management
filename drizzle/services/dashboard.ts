import { db, findFirst } from "../db";
import {
  and,
  between,
  count,
  countDistinct,
  desc,
  eq,
  isNull,
  ne,
  notInArray,
  sql,
  sum,
  or,
} from "drizzle-orm";
import { INTERVAL_MAP, IntervalKey } from "@/app/api/utils";
import { lineItems, orders, shipments, transactions } from "../schemas/orders";
import { purchase, purchaseTransactions } from "../schemas/purchase";
import { expenses } from "../schemas/expenses";
import { users } from "../schemas/users";
import { adjustments, products } from "../schemas/products";

export const getOverview = async (interval: IntervalKey, storeId: any) => {
  const map = INTERVAL_MAP[interval];

  return await db
    .select({
      name: sql`day`,
      sale: sql`COALESCE(SUM(${orders.total}), 0)`,
      purchase: sql`COALESCE(SUM(${purchase.total}), 0)`,
    })
    .from(
      sql`generate_series(
          ${map.start}::timestamptz,
          ${map.end}::timestamptz,
          ${map.interval}::interval) as day`
    )
    .leftJoin(
      orders,
      and(
        between(
          orders.createdAt,
          sql`day`,
          sql`day + ${map.interval}::interval`
        ),
        eq(orders.storeId, storeId),
        or(
          isNull(orders.shipmentStatus),
          notInArray(orders.shipmentStatus, [
            "cancelled",
            "rto initiated",
            "rto delivered",
          ])
        )
      )
    )
    .leftJoin(
      purchase,
      and(
        between(
          purchase.createdAt,
          sql`day`,
          sql`day + ${map.interval}::interval`
        ),
        eq(purchase.storeId, storeId)
      )
    )
    .groupBy(({ name }) => name)
    .orderBy(({ name }) => name);
};

export const getTransactionsOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      transactions.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(transactions.storeId, storeId)
  );

  return await db
    .select({
      name: transactions.name,
      total: sql`COALESCE(SUM(${transactions.amount}) FILTER (WHERE kind = 'sale'), 0) -
            COALESCE(SUM(${transactions.amount}) FILTER (WHERE kind = 'refund'), 0) AS net_total`,
    })
    .from(transactions)
    .where(filters)
    .groupBy(transactions.name);
};

export const getPurchaseTransactionsOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      purchaseTransactions.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(purchaseTransactions.storeId, storeId)
  );

  return await db
    .select({
      name: purchaseTransactions.name,
      total: sql`COALESCE(SUM(${purchaseTransactions.amount}) FILTER (WHERE kind = 'paid'), 0) -
            COALESCE(SUM(${purchaseTransactions.amount}) FILTER (WHERE kind = 'refund'), 0) AS net_total`,
    })
    .from(purchaseTransactions)
    .where(filters)
    .groupBy(purchaseTransactions.name);
};

export const getExpensesOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      expenses.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(expenses.storeId, storeId)
  );

  return await db
    .select({
      name: expenses.category,
      total: sum(expenses.amount),
    })
    .from(expenses)
    .where(filters)
    .groupBy(expenses.category);
};

export const getEmployeesOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      orders.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(orders.storeId, storeId)
  );

  return await db
    .select({
      id: orders.employeeId,
      name: users.name,
      total: sum(orders.total),
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.employeeId))
    .where(filters)
    .groupBy(orders.employeeId, users.name);
};

export const getCustomersOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      orders.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(orders.storeId, storeId)
  );

  return await db
    .select({
      id: orders.customerId,
      name: users.name,
      phone: users.phone,
      email: users.email,
      total: sum(orders.total),
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.customerId))
    .where(filters)
    .limit(6)
    .orderBy(({ total }) => desc(total))
    .groupBy(orders.customerId, users.name, users.phone, users.email);
};

export const getProductsOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      orders.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(orders.storeId, storeId)
  );

  return await db
    .select({
      id: products.id,
      name: lineItems.title,
      image: lineItems.image,
      total: sum(lineItems.currentQuantity),
    })
    .from(orders)
    .leftJoin(lineItems, eq(lineItems.orderId, orders.id))
    .leftJoin(products, eq(products.id, lineItems.productId))
    .where(filters)
    .limit(6)
    .orderBy(({ total }) => desc(total))
    .groupBy(products.id, lineItems.title, lineItems.image);
};

export const getAdjustmentsOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      adjustments.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(adjustments.storeId, storeId)
  );

  return await db
    .select({
      in: sql`SUM(${adjustments.quantity}) FILTER (WHERE ${adjustments.quantity} > 0)`,
      out: sql`SUM(ABS(${adjustments.quantity})) FILTER (WHERE ${adjustments.quantity} < 0)`,
    })
    .from(adjustments)
    .where(filters)
    .then(findFirst);
};

export const getShipmentsOverview = async (
  interval: IntervalKey,
  storeId: any
) => {
  const map = INTERVAL_MAP[interval];

  const filters = and(
    between(
      orders.createdAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(orders.storeId, storeId)
  );

  const filtersShipment = and(
    between(
      shipments.updatedAt,
      sql`${map.start}::timestamptz`,
      sql`${map.end}::timestamptz`
    ),
    eq(shipments.storeId, storeId),
    ne(shipments.status, "cancelled")
  );

  const pending = await db
    .select({
      createdAt: orders.createdAt,
      total: count(orders.id),
    })
    .from(orders)
    .where(filters)
    .groupBy(orders.createdAt);

  const shipment = await db
    .select({
      name: shipments.status,
      total: countDistinct(shipments.id),
    })
    .from(shipments)
    .where(filtersShipment)
    .groupBy(shipments.status);
  return { shipment, pending };
};
