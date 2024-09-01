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
import { users } from "./users";
import { stores } from "./stores";

const roles = ["simple", "variable"] as const;
const status = ["active", "archived"] as const;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: roles }).default("simple").notNull(),
  image: text("image"),
  status: text("status", { enum: status }).default("active").notNull(),
  options: json("options").array().notNull(),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const variants = pgTable("variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, {
      onDelete: "cascade",
    }),
  barcode: text("barcode").unique(),
  sku: text("sku"),
  hsn: text("hsn").notNull(),
  title: text("title").notNull(),
  purchasePrice: decimal("purchase_price").notNull(),
  salePrice: decimal("sale_price").notNull(),
  taxRate: decimal("tax_rate").notNull(),
  options: json("options").array(),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, {
      onDelete: "cascade",
    }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, {
      onDelete: "cascade",
    }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => variants.id, {
      onDelete: "cascade",
    }),
  stock: integer("stock").default(0),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productCreateSchema = createInsertSchema(products);

export const variantCreateSchema = createInsertSchema(variants);

export const inventoryCreateSchema = createInsertSchema(inventory);

// stock transfers
export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  source: integer("source").references(() => stores.id, {
    onDelete: "cascade",
  }),
  destination: integer("destination").references(() => stores.id, {
    onDelete: "cascade",
  }),
  notes: text("notes"),
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

export const transferLineItems = pgTable("transfer_line_items", {
  id: serial("id").primaryKey(),
  transferId: integer("transfer_id").references(() => transfers.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  variantTitle: text("variant_title").notNull(),
  barcode: text("barcode").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
export const transferCreateSchema = createInsertSchema(transfers);
export const lineItemCreateSchema = createInsertSchema(transferLineItems);

// product adjustments
export const adjustments = pgTable("adjustments", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "cascade",
  }),
  quantity: integer("quantity"),
  reason: text("reason"),
  notes: text("notes"),
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

export const adjustmentCreateSchema = createInsertSchema(adjustments);

// product barcode
export const barcodes = pgTable("barcodes", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_by").references(() => products.id, {
    onDelete: "cascade",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "cascade",
  }),
  quantity: integer("quantity"),
  status: text("status"),
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

export const barcodeCreateSchema = createInsertSchema(barcodes);
