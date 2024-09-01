import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

import {
  serial,
  text,
  timestamp,
  pgTable,
  integer,
  json,
} from "drizzle-orm/pg-core";
import { stores } from "./stores";

const roles = ["admin", "user", "employee", "customer", "supplier"] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  phone: text("phone").unique(),
  email: text("email").unique(),
  role: text("role", { enum: roles }).default("customer").notNull(),
  password: text("password"),
  otp: text("otp"),
  address: json("address").$type<{
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstin: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userCreateSchema = createInsertSchema(users, {
  name: z.string().min(1, { message: "Required" }),
  phone: z.string().length(10, { message: "Invalid phone" }),
  email: z.string().email({ message: "Invalid email" }),
});
