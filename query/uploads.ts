import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transfers)[":id"]["$get"]
>;

export type TransferType = Omit<ResponseType, "success">["data"];

type CreateResponseType = InferResponseType<typeof client.api.uploads.$post>;
type CreateRequestType = InferRequestType<typeof client.api.uploads.$post>;

type DeleteResponseType = InferResponseType<
  (typeof client.api.uploads)["$delete"]
>;

export const getFiles = async () => {
  const client = await getClient();
  const response = await client.api.uploads.$get();

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getFile = async (url: string) => {
  const client = await getClient();
  const response = await client.api.uploads[":url"].$get({
    param: {
      url,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const useCreateUpload = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (file) => {
      const response = await client.api.uploads.$post({
        form: {
          file,
        },
      });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success(`File uploaded`),
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteFile = () => {
  return useMutation<DeleteResponseType, Error, string>({
    mutationFn: async (url: string) => {
      const response = await client.api.uploads.$delete({
        json: {
          url,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success(`File deleted`),
    onError: (error) => toast.error(error.message),
  });
};
