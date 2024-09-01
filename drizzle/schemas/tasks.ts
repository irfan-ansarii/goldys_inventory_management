import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { sql } from "drizzle-orm";

const statuses = [
  "pending",
  "cancelled",
  "on hold",
  "in progress",
  "completed",
  "overdue",
] as const;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: statuses }).notNull(),
  tags: text("tags")
    .array()
    .default(sql`'{}'::text[]`),
  users: text("users")
    .array()
    .default(sql`'{}'::text[]`),
  files: text("files")
    .array()
    .default(sql`'{}'::text[]`),
  actions: text("actions")
    .array()
    .default(sql`'{}'::text[]`),
  dueAt: timestamp("due_at"),
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

export const taskSchema = createInsertSchema(tasks).extend({
  tags: z.string().array(),
  actions: z.string().array(),
  users: z.string().array(),
  files: z.string().array(),
  dueAt: z.any(),
});
