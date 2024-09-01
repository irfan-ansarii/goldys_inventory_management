import { createInsertSchema } from "drizzle-zod";

import {
  serial,
  text,
  timestamp,
  pgTable,
  integer,
  decimal,
  json,
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

const transactionsKind = ["paid", "void", "refund"] as const;

export const purchase = pgTable("purchase", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id")
    .references(() => stores.id, {
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  supplierId: integer("supplier_id").references(() => users.id, {
    onDelete: "set null",
  }),
  source: text("source")
    .array()
    .default(sql`'{}'::text[]`),
  billing: text("billing")
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
  notes: text("notes"),
  tags: text("tags")
    .array()
    .default(sql`'{}'::text[]`),

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

export const purchaseLineItems = pgTable("purchase_line_items", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  purchaseId: integer("purchase_id").references(() => purchase.id, {
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
  purchasePrice: decimal("purchase_price"),
  quantity: integer("quantity") /** original quantity sold */,
  currentQuantity:
    integer("current_quantity") /** actual quantity after sold */,
  taxRate: decimal("tax_rate"),
  subtotal: decimal("subtotal"),
  discount: decimal("discount").default("0"),
  tax: decimal("tax"),
  total: decimal("total"),
  taxLines: json("tax_lines").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const purchaseTransactions = pgTable("purchaseTransactions", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  purchaseId: integer("purchase_id").references(() => purchase.id, {
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

export const purchaseCreateSchema = createInsertSchema(purchase);

export const purchaseLineItemCreateSchema =
  createInsertSchema(purchaseLineItems);

export const purchaseTransactionCreateSchema =
  createInsertSchema(purchaseTransactions);
