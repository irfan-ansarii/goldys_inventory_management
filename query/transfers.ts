import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transfers)[":id"]["$get"]
>;

export type TransferType = Omit<ResponseType, "success">["data"];

type CreateResponseType = InferResponseType<typeof client.api.transfers.$post>;
type CreateRequestType = InferRequestType<
  typeof client.api.transfers.$post
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.transfers)[":id"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.transfers)[":id"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.transfers)[":id"]["$delete"]
>;

export const getTransfers = async (query?: Record<string, any>) => {
  const client = await getClient();
  const response = await client.api.transfers.$get({
    query: query,
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getTransfer = async (id: any) => {
  const client = await getClient();
  const response = await client.api.transfers[":id"].$get({
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

export const useCreateTransfer = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transfers.$post({ json });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success(`Transfer completd`),
    onError: (error) => toast.error(error.message),
  });
};

export const useUpdateTransfer = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transfers[":id"].$put({
        param: { id },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Transfer updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteTransfer = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.transfers[":id"].$delete({
        param: {
          id,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Transfer deleted`),
    onError: (error) => toast.error(error.message),
  });
};
