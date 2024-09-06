import { eq, and } from "drizzle-orm";
import { db, findFirst } from "../db";
import { options } from "../schemas/options";

// create option
export const createOption = async (values: any) => {
  return await db
    .insert(options)
    .values({ ...values })
    .returning()
    .then(findFirst);
};

export const upsertOption = async (values: any) => {
  const { storeId, key } = values;
  const response = await db
    .select()
    .from(options)
    .where(and(eq(options.key, key), eq(options.storeId, storeId)))
    .then(findFirst);

  if (response) {
    return await updateOption(key, values);
  }
  return await createOption(values);
};
// get option
export const getOption = async (key: string, storeId?: number) => {
  return await db
    .select()
    .from(options)
    .where(
      and(
        eq(options.key, key),
        storeId ? eq(options.storeId, storeId) : undefined
      )
    )
    .then(findFirst);
};

// get options
export const getOptions = async (storeId: number) => {
  return await db.select().from(options).where(eq(options.storeId, storeId));
};
// update options
export const updateOption = async (key: string, values: any) => {
  return await db
    .update(options)
    .set(values)
    .where(eq(options.key, key))
    .returning()
    .then(findFirst);
};
// delete options
export const deleteOption = async (key: string) => {
  return await db
    .delete(options)
    .where(eq(options.key, key))
    .returning()
    .then(findFirst);
};
