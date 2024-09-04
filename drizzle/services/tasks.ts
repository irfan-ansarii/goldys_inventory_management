import { z } from "zod";
import { db, findFirst } from "../db";
import { tasks, taskSchema } from "../schemas/tasks";
import {
  and,
  arrayContains,
  countDistinct,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
} from "drizzle-orm";
import { PAGE_LIMIT } from "@/app/api/utils";
import { users } from "../schemas/users";
import { alias } from "drizzle-orm/pg-core";

const schema = taskSchema
  .omit({
    id: true,
  })
  .extend({
    tags: z.string().array(),
    users: z.string().array(),
    actions: z.string().array(),
    files: z.string().array(),
  });

const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");

export const createTask = async (values: z.infer<typeof schema>) => {
  return await db.insert(tasks).values(values).returning().then(findFirst);
};

export const getTask = async (id: any) => {
  return await db.select().from(tasks).where(eq(tasks.id, id)).then(findFirst);
};

export const getTasks = async (params?: Record<string, any>) => {
  const {
    q,
    status,
    statuses,
    userId,
    limit = PAGE_LIMIT,
    page = 1,
  } = params || {};

  const filters = and(
    status ? eq(tasks.status, status) : undefined,
    statuses ? inArray(tasks.status, statuses) : undefined,
    userId
      ? or(eq(tasks.createdBy, userId), arrayContains(tasks.users, [userId]))
      : undefined,
    q
      ? or(
          ilike(tasks.title, `%${q}%`),
          ilike(tasks.description, `%${q}%`),
          arrayContains(tasks.tags, [q])
        )
      : undefined
  );

  const results = await db
    .select({
      ...getTableColumns(tasks),
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
      updatedBy: {
        id: updatedBy.id,
        name: updatedBy.name,
      },
    })
    .from(tasks)
    .where(filters)
    .leftJoin(createdBy, eq(createdBy.id, tasks.createdBy))
    .leftJoin(updatedBy, eq(updatedBy.id, tasks.updatedBy))
    .groupBy(tasks.id, createdBy.id, updatedBy.id)
    .orderBy(desc(tasks.id));

  const records = await db
    .select({ total: countDistinct(tasks) })
    .from(tasks)
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

export const updateTask = async (id: any, values: any) => {
  return await db
    .update(tasks)
    .set(values)
    .where(eq(tasks.id, id))
    .returning()
    .then(findFirst);
};

export const deleteTask = async (id: any) => {
  return await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning()
    .then(findFirst);
};
