import { createInsertSchema } from "drizzle-zod";
import { serial, text, timestamp, pgTable, json } from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  logo: text("logo").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  notes: text("notes"),
  address: json("address").default({}),
  gstin: text("gstin"),
  domain: text("domain"),
  token: text("token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const storeCreateSchema = createInsertSchema(stores);
