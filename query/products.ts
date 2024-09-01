import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";

type ProductResponseType = InferResponseType<typeof client.api.products.$get>;

export type ProductType = Omit<ProductResponseType, "success">["data"][0];

export type VariantsType = Pick<ProductType, "variants">["variants"];

export type InventoryType = Pick<ProductType, "inventories">["inventories"];

type CreateResponseType = InferResponseType<typeof client.api.products.$post>;
type CreateRequestType = InferRequestType<
  typeof client.api.products.$post
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.products)[":id"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.products)[":id"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.products)[":id"]["$delete"]
>;

type GetResponseType = InferResponseType<
  typeof client.api.products.variants.$get
>;

export type ProductVariantType = Omit<GetResponseType, "success">["data"][0];

export const getProducts = async (query: Record<string, string>) => {
  const client = await getClient();
  const response = await client.api.products.$get({ query });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getProduct = async (id: any) => {
  const client = await getClient();
  const response = await client.api.products[":id"].$get({
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

export const getVariants = async (query: Record<string, any>) => {
  const response = await client.api.products.variants.$get({
    query,
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const useCreateProduct = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.products.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`${data.title} created`),
    onError: (error) => toast.error(error.message),
  });
};

export const useUpdateProduct = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.products[":id"].$put({
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

export const useDeleteProduct = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.products[":id"].$delete({
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

export const useGetVariants = (query: Record<string, string>) => {
  return useQuery<GetResponseType, Error>({
    queryKey: ["variants", query],
    queryFn: async () => {
      const response = await client.api.products.variants.$get({
        query,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
  });
};
