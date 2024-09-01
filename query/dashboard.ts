import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";

export type OverviewType = InferResponseType<
  typeof client.api.dashboard.overview.$get
>;
export type transactionsOverviewType = InferResponseType<
  typeof client.api.dashboard.transactions.$get
>;
export type ExpensesOverviewType = InferResponseType<
  typeof client.api.dashboard.expenses.$get
>;

export const getOverview = async (interval: string) => {
  const client = await getClient();
  const response = await client.api.dashboard.overview.$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getTransactionsOverview = async (interval: string) => {
  const client = await getClient();
  const response = await client.api.dashboard.transactions.$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};
export const getPurchaseTransactionsOverview = async (interval: string) => {
  const client = await getClient();
  const response = await client.api.dashboard["purchase-transactions"].$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getExpensesOverview = async (interval: string) => {
  const client = await getClient();
  const response = await client.api.dashboard.expenses.$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getEmployeesOverview = async (interval: string) => {
  const client = await getClient();
  const response = await client.api.dashboard.employee.$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};
export const getCustomersOverview = async (interval: string) => {
  const client = await getClient();
  const response = await client.api.dashboard.customer.$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getProductsOverview = async (interval: string) => {
  const client = await getClient();
  const response = await client.api.dashboard.products.$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};
export const getAdjustmentsOverview = async (interval: string) => {
  const client = await getClient();

  const response = await client.api.dashboard.adjustments.$get({
    query: { interval },
  });
  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};
