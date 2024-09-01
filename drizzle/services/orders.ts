import { alias } from "drizzle-orm/pg-core";
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sql,
} from "drizzle-orm";
import { users } from "../schemas/users";
import { db, findFirst } from "../db";
import {
  lineItems,
  orders,
  shipmentLineItems,
  shipmentLineItemSchema,
  shipments,
  shipmentSchema,
  transactions,
} from "../schemas/orders";
import { PAGE_LIMIT } from "@/app/api/utils";
import { z } from "zod";
const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

const employee = alias(users, "employee");
const customer = alias(users, "customer");

// create order
export const createOrder = async (values: any) => {
  return await db
    .insert(orders)
    .values({ ...values })
    .returning()
    .then(findFirst);
};

// create line items
export const createLineItems = async (values: any) => {
  return await db.insert(lineItems).values(values).returning();
};

// update order
export const updateOrder = async (id: any, values: any) => {
  return await db
    .update(orders)
    .set(values)
    .where(eq(orders.id, id))
    .returning()
    .then(findFirst);
};

// update line-item
export const updateLineItem = async (id: any, values: any) => {
  return await db
    .update(lineItems)
    .set(values)
    .where(eq(lineItems.id, id))
    .returning()
    .then(findFirst);
};

// remove order
export const deleteOrder = async (id: any) => {
  return await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning()
    .then(findFirst);
};

export const getOrders = async (params: Record<string, any>) => {
  const {
    q,
    status,
    shipmentStatus,
    limit = PAGE_LIMIT,
    page = 1,
    storeId,
  } = params || {};

  const filters = and(
    eq(orders.storeId, storeId),
    status ? eq(orders.paymentStatus, sql`LOWER(${status})`) : undefined,
    shipmentStatus
      ? eq(orders.shipmentStatus, sql`LOWER(${shipmentStatus})`)
      : undefined,
    q
      ? or(
          ilike(orders.name, `%${q}%`),
          ilike(employee.name, `%${q}%`),
          ilike(customer.name, `%${q}%`),
          ilike(customer.phone, `%${q}%`),
          ilike(customer.email, `%${q}%`),
          ilike(shipments.awb, `%${q}%`)
        )
      : undefined
  );
  const results = await db
    .select({
      ...getTableColumns(orders),
      soldBy: {
        id: employee.id,
        name: employee.name,
      },
      soldTo: {
        id: customer.id,
        name: customer.name,
      },
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(orders)
    .leftJoin(createdBy, eq(createdBy.id, orders.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, orders.updatedBy))
    .leftJoin(employee, eq(employee.id, orders.employeeId))
    .leftJoin(customer, eq(customer.id, orders.customerId))
    .leftJoin(shipments, eq(shipments.orderId, orders.id))
    .where(filters)
    .groupBy(orders.id, customer.id, employee.id, createdBy.id, updatedBy.id)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const records = await db
    .select({ total: countDistinct(orders.id) })
    .from(orders)
    .leftJoin(employee, eq(employee.id, orders.employeeId))
    .leftJoin(customer, eq(customer.id, orders.customerId))
    .leftJoin(shipments, eq(shipments.orderId, orders.id))
    .where(filters)
    .then(findFirst);

  return {
    data: results,
    meta: {
      page: parseInt(page),
      size: limit,
      pages: Math.ceil(records.total / limit),
      ...records,
    },
  };
};

export const getLineItems = async (orderId: any) => {
  return await db
    .select({
      ...getTableColumns(lineItems),
    })
    .from(lineItems)
    .where(eq(lineItems.orderId, orderId));
};

export const getOrder = async (id: any, params?: Record<string, any>) => {
  const { name, storeId } = params || {};
  return await db
    .select({
      ...getTableColumns(orders),
      soldBy: {
        id: employee.id,
        name: employee.name,
        phone: users.phone,
        email: users.email,
      },
      soldTo: {
        id: users.id,
        name: users.name,
        phone: users.phone,
        email: users.email,
      },
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(orders)
    .leftJoin(createdBy, eq(createdBy.id, orders.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, orders.updatedBy))
    .leftJoin(employee, eq(employee.id, orders.employeeId))
    .leftJoin(users, eq(users.id, orders.customerId))
    .where(
      and(
        id ? eq(orders.id, id) : undefined,
        storeId ? eq(orders.storeId, storeId) : undefined,
        name ? eq(orders.name, name) : undefined
      )
    )
    .groupBy(orders.id, users.id, employee.id, createdBy.id, updatedBy.id)
    .then(findFirst);
};

// create transactions
export const createTransactions = async (values: any) => {
  return await db.insert(transactions).values(values).returning();
};

// get transactions
export const getTransactions = async (orderId: any) => {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.orderId, orderId));
};

// create shipment
export const createShipment = async (
  values: z.infer<typeof shipmentSchema>
) => {
  return await db
    .insert(shipments)
    .values({ ...values })
    .returning()
    .then(findFirst);
};

// create shipment line items
export const createShipmentLineItems = async (
  values: z.infer<typeof shipmentLineItemSchema>[]
) => {
  return await db.insert(shipmentLineItems).values(values).returning();
};

// get shipment
export const getShipment = async (shipmentId: any) => {
  return await db
    .select()
    .from(shipments)
    .where(eq(shipments.id, shipmentId))
    .then(findFirst);
};

// get shipments
export const getShipments = async (orderId: any) => {
  return await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, orderId))
    .orderBy(asc(shipments.id));
};

// get shipment line items
export const getShipmentLineItems = async (shipmentId: any) => {
  return await db
    .select()
    .from(shipmentLineItems)
    .where(eq(shipmentLineItems.shipmentId, shipmentId));
};

// update shipment
export const updateShipment = async (shipmentId: any, values: any) => {
  return await db
    .update(shipments)
    .set(values)
    .where(eq(shipments.id, shipmentId))
    .returning()
    .then(findFirst);
};

// update shipment line item
export const updateShipmentLineItem = async (
  shipmentId: any,
  values: z.infer<typeof shipmentLineItemSchema>
) => {
  return await db
    .update(shipmentLineItems)
    .set(values)
    .where(eq(shipmentLineItems.shipmentId, shipmentId))
    .returning()
    .then(findFirst);
};

// update shipment
export const deleteShipment = async (shipmentId: any) => {
  return await db
    .delete(shipments)
    .where(eq(shipments.id, shipmentId))
    .returning()
    .then(findFirst);
};
