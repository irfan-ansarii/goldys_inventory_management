// import { Hono } from "hono";
// import Redis from "ioredis";
// import { streamText } from "hono/streaming";

// // Define the key to listen and publish messages to
// const setKey = "cart";

// // Create a redis subscriber
// const redisSubscriber = new Redis(process.env.UPSTASH_REDIS_URL!);
// const app = new Hono()
//   // test
//   .get("/", async (c) => {
//     return streamText(c, async (stream) => {
//       redisSubscriber.subscribe(setKey, (err) => {
//         if (err) console.log(err);
//       });

//       // Listen for new posts from Redis
//       redisSubscriber.on("message", (channel, message) => {
//         if (channel === setKey) stream.write(`${message}`);
//       });

//       redisSubscriber.on("end", () => {
//         stream.close();
//       });
//     });
//   });
// export default app;
