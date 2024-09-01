import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.adjustments)[":id"]["$get"]
>;

export type AdjustmentType = Omit<ResponseType, "success">["data"];

type CreateResponseType = InferResponseType<
  typeof client.api.adjustments.$post
>;
type CreateRequestType = InferRequestType<
  typeof client.api.adjustments.$post
>["json"];

export const getAdjustments = async (query?: Record<string, any>) => {
  const client = await getClient();

  const response = await client.api.adjustments.$get({
    query: query,
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getAdjustment = async (id: any) => {
  const client = await getClient();
  const response = await client.api.adjustments[":id"].$get({
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

export const useCreateAdjustment = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.adjustments.$post({ json });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success(`Inventory updated`),
    onError: (error) => toast.error(error.message),
  });
};
