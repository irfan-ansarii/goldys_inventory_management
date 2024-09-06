import { Redis } from "@upstash/redis";

// The function that takes care of obtaining the country code from Vercel headers
// And publishing messages to the Upstash Redis database with the current timestamp
export async function publishNotification(data) {
  const redis = Redis.fromEnv();

  await redis.publish("cart", JSON.stringify(data));
}
