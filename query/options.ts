import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.options.$get>;

export type OptionType = Omit<ResponseType, "success">["data"][0];

type UpdateResponseType = InferResponseType<
  (typeof client.api.options)[":key"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.options)[":key"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.options)[":key"]["$delete"]
>;

type GetResponseType = InferResponseType<
  (typeof client.api.options)[":key"]["$get"]
>;

export const getOption = async (
  key: string,
  query?: Record<string, string>
) => {
  const client = await getClient();
  const response = await client.api.options[":key"].$get({
    param: {
      key,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const useUpdateOption = (key: string) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.options[":key"].$put({
        param: { key },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Settings Updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteOption = (key: string) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.options[":key"].$delete({
        param: {
          key,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Settings Deleted`),
    onError: (error) => toast.error(error.message),
  });
};

export const useGetOption = (key: string, query?: Record<string, string>) => {
  return useQuery<GetResponseType, Error>({
    queryKey: ["options", key, query],
    queryFn: async () => {
      const response = await client.api.options[":key"].$get({
        param: {
          key,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
  });
};
