import { createInsertSchema } from "drizzle-zod";

import { serial, text, timestamp, pgTable, integer } from "drizzle-orm/pg-core";

import { users } from "./users";
import { stores } from "./stores";

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  storeId: serial("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  key: text("key").notNull(),
  value: text("value").notNull(),
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

export const optionCreateSchema = createInsertSchema(options);
