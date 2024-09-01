import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

type ExpenseResponseType = InferResponseType<
  (typeof client.api.expenses)[":id"]["$get"]
>;

export type ExpenseType = Omit<ExpenseResponseType, "success">["data"];

type CreateResponseType = InferResponseType<typeof client.api.expenses.$post>;

type CreateRequestType = InferRequestType<
  typeof client.api.expenses.$post
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.expenses)[":id"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.expenses)[":id"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.expenses)[":id"]["$delete"]
>;

export const getExpenses = async (query: Record<string, any>) => {
  const client = await getClient();

  const response = await client.api.expenses.$get({
    query,
  });
  if (!response.ok)
    throw {
      status: 500,
    };

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getExpense = async (id: any) => {
  const client = await getClient();
  const response = await client.api.expenses[":id"].$get({
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

export const useCreateExpense = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.expenses.$post({ json });
      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`${data.title} created`),
    onError: (error) => toast.error(error.message),
  });
};

export const useUpdateExpense = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.expenses[":id"].$put({
        param: { id },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`${data.title} updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteExpense = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.expenses[":id"].$delete({
        param: {
          id,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;

      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`${data.title} deleted`),
    onError: (error) => toast.error(error.message),
  });
};
