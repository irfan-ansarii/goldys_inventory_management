import { createInsertSchema } from "drizzle-zod";

import {
  serial,
  text,
  timestamp,
  pgTable,
  integer,
  decimal,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { stores } from "./stores";
import { products, variants } from "./products";

const paymentStatus = [
  "unpaid",
  "paid",
  "partially paid",
  "overpaid",
  "voided",
  "refunded",
] as const;

const shipmentStatus = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "return initiated",
  "returned",
  "rto initiated",
  "rto delivered",
] as const;

const transactionsKind = ["sale", "void", "refund"] as const;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id")
    .references(() => stores.id, {
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  customerId: integer("customer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  employeeId: integer("employee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  billing: text("billing")
    .array()
    .default(sql`'{}'::text[]`),
  shipping: text("shipping")
    .array()
    .default(sql`'{}'::text[]`),
  subtotal: decimal("subtotal").notNull(),
  discount: decimal("discount").default("0").notNull(),
  tax: decimal("tax").notNull().default("0"),
  charges: json("charges").default({}),
  total: decimal("total").notNull(),
  due: decimal("due").default("0").notNull(),
  taxKind: json("tax_kind").$type<{ saleType: string; type: string }>(),
  taxLines: json("tax_lines").array(),
  discountLines: json("discount_lines"),
  paymentStatus: text("payment_status", { enum: paymentStatus }).default(
    "unpaid"
  ),
  shipmentStatus: text("shipment_status", { enum: shipmentStatus }),
  notes: text("notes"),
  invoice: text("invoice"),
  tags: text("tags")
    .array()
    .default(sql`'{}'::text[]`),
  additionalMeta: json("additional_meta").default({}),
  cancelReason: text("cancel_reason"),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const lineItems = pgTable("line_items", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "set null",
  }),
  title: text("title"),
  variantTitle: text("variant_title"),
  image: text("image"),
  barcode: text("barcode"),
  sku: text("sku"),
  hsn: text("hsn"),
  price: decimal("price"),
  salePrice: decimal("sale_price"),
  quantity: integer("quantity") /** original quantity sold */,
  currentQuantity:
    integer("current_quantity") /** actual quantity after return */,
  requiresShipping: boolean("requires_shipping").default(false),
  shippingQuantity:
    integer("shipping_quantity") /** quantity pending to be shipped */,
  taxRate: decimal("tax_rate"),
  subtotal: decimal("subtotal"),
  discount: decimal("discount").default("0"),
  tax: decimal("tax"),
  total: decimal("total"),
  taxLines: json("tax_lines").array(),
  properties: json("properties").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  name: text("name"),
  kind: text("kind", { enum: transactionsKind }),
  amount: decimal("amount"),
  paymentId: text("payment_id"),
  paymentOrderId: text("payment_order_id"),
  status: text("status"),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Shipments
 */
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  parentId: integer("parent_id"),
  carrier: text("carrier"),
  awb: text("awb"),
  trackingUrl: text("tracking_url"),
  kind: text("kind", { enum: ["forward", "return", "rto"] }),
  status: text("status", { enum: shipmentStatus }),
  actions: json("actions").default([]),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const shipmentLineItems = pgTable("shipment_line_items", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id, {
    onDelete: "cascade",
  }),
  lineItemId: integer("line_item_id").references(() => lineItems.id, {
    onDelete: "set null",
  }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "set null",
  }),
  title: text("title"),
  variantTitle: text("variant_title"),
  image: text("image"),
  price: decimal("price"),
  quantity: integer("quantity") /** quantity being shipped */,
  total: decimal("total"),
});

export const orderCreateSchema = createInsertSchema(orders);

export const lineItemCreateSchema = createInsertSchema(lineItems);

export const transactionCreateSchema = createInsertSchema(transactions);

export const shipmentSchema = createInsertSchema(shipments);
export const shipmentLineItemSchema = createInsertSchema(shipmentLineItems);
