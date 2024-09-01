import { Hono } from "hono";
import { del, head, list, put } from "@vercel/blob";

const app = new Hono()
  .post("/", async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    const blob = await put(file.name, file, { access: "public" });

    return c.json({ success: true, data: blob }, 201);
  })
  .get("/", async (c) => {
    const { blobs } = await list();
    return c.json({ success: true, data: blobs }, 200);
  })
  .get("/:url", async (c) => {
    const { url } = c.req.param();
    const blob = await head(url);
    return c.json({ success: true, data: blob }, 200);
  })
  .delete("/", async (c) => {
    const { url } = await c.req.json();

    await del(url);
    return c.json({ success: true }, 200);
  });

export default app;
