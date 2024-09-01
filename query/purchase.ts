import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

export type PurchaseType = InferResponseType<
  (typeof client.api.purchases)[":id"]["$get"]
>["data"];

type CreateResponseType = InferResponseType<typeof client.api.purchases.$post>;
type CreateRequestType = InferRequestType<
  typeof client.api.purchases.$post
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.purchases)[":id"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.purchases)[":id"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.purchases)[":id"]["$delete"]
>;

type TransactionCreateResponseType = InferResponseType<
  (typeof client.api.purchases)[":id"]["transactions"]["$post"]
>;
type TransactionCreateRequestType = InferRequestType<
  (typeof client.api.purchases)[":id"]["transactions"]["$post"]
>["json"];

// get purchases
export const getpurchases = async (query: Record<string, string>) => {
  const client = await getClient();
  const response = await client.api.purchases.$get({ query });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

// get purchase
export const getPurchase = async (id: any) => {
  const client = await getClient();
  const response = await client.api.purchases[":id"].$get({
    param: {
      id,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

// get transactions
export const getPurchaseTransactions = async (orderId: any) => {
  const client = await getClient();
  const response = await client.api.purchases[":id"].transactions.$get({
    param: { id: orderId },
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

/** create purchase */
export const useCreatePurchase = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.purchases.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) =>
      toast.success(`Purchase order ${data.name} created`),
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/** update purchase */
export const useUpdatePurchase = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.purchases[":id"].$put({
        param: { id },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) =>
      toast.success(`Purchase order ${data.name} updated`),
    onError: (error) => toast.error(error.message),
  });
};

/** delete purchase */
export const useDeletePurchase = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.purchases[":id"].$delete({
        param: {
          id,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) =>
      toast.success(`Purchase order ${data.name} deleted`),
    onError: (error) => toast.error(error.message),
  });
};

/** create purchase transaction */
export const useCreatePurchaseTransaction = (id: any) => {
  return useMutation<
    TransactionCreateResponseType,
    Error,
    TransactionCreateRequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.purchases[":id"].transactions.$post({
        param: {
          id,
        },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },

    onSuccess: () => {
      toast.success("Transaction created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
