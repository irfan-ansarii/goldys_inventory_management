import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { jwt } from "hono/jwt";
import { JwtVariables } from "hono/jwt";
import { HTTPException } from "hono/http-exception";

// import streamHandler from "@/app/api/routes/stream";
import authHandler from "@/app/api/routes/auth";
import webhookHandler from "@/app/api/routes/webhooks";
import uploadHandler from "@/app/api/routes/uploads";
import storesHandler from "@/app/api/routes/stores";
import usersHandler from "@/app/api/routes/users";
import productsHandler from "@/app/api/routes/products";
import transfersHandler from "@/app/api/routes/transfers";
import adjustmentsHandler from "@/app/api/routes/adjustments";
import barcodesHandler from "@/app/api/routes/barcodes";
import ordersHandler from "@/app/api/routes/orders";
import purchaseHandler from "@/app/api/routes/purchase";
import expensesHandler from "@/app/api/routes/expenses";
import optionsHandler from "@/app/api/routes/options";
import dashboardHandler from "@/app/api/routes/dashboard";
import tasksHandler from "@/app/api/routes/tasks";

export const runtime = "edge";

type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>().basePath("/api");

app.use("*", cors());

const routes = app
  .route("/auth", authHandler)
  .route("/webhooks", webhookHandler)
  // .route("/stream", streamHandler)
  .all("/*", jwt({ secret: "secret" }))
  .route("/uploads", uploadHandler)
  .route("/stores", storesHandler)
  .route("/users", usersHandler)
  .route("/products", productsHandler)
  .route("/transfers", transfersHandler)
  .route("/adjustments", adjustmentsHandler)
  .route("/barcodes", barcodesHandler)
  .route("/orders", ordersHandler)
  .route("/purchases", purchaseHandler)
  .route("/expenses", expensesHandler)
  .route("/options", optionsHandler)
  .route("/dashboard", dashboardHandler)
  .route("/tasks", tasksHandler)

  .onError((err: any, c) => {
    let errorResponse = {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
      success: false,
    };
    if (err instanceof HTTPException) {
      const res = err.getResponse();
    }
    return c.json({
      ...errorResponse,
    });
  });

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
