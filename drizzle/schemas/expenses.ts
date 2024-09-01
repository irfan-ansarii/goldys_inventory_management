import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

import {
  serial,
  text,
  timestamp,
  pgTable,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { stores } from "./stores";
import { users } from "./users";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount").notNull(),
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

export const expenseCreateSchema = createInsertSchema(expenses, {
  createdAt: z.string(),
});
