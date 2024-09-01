import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type GetRequestType = InferRequestType<typeof client.api.stores.$get>;
type GetResponseType = InferResponseType<typeof client.api.stores.$get>;

type GetSingleRequestType = InferRequestType<
  (typeof client.api.stores)[":id"]["$get"]
>;
type GetSingleResponseType = InferResponseType<
  (typeof client.api.stores)[":id"]["$get"]
>;

export type StoreType = Omit<GetSingleResponseType, "success">["data"];

type CreateRequestType = InferRequestType<
  typeof client.api.stores.$post
>["json"];
type CreateResponseType = InferResponseType<typeof client.api.stores.$post>;

type UpdateRequestType = InferRequestType<
  (typeof client.api.stores)[":id"]["$put"]
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.stores)[":id"]["$put"]
>;

type SwitchResponseType = InferResponseType<
  (typeof client.api.stores)[":id"]["$post"]
>;

type DeleteResponseType = InferResponseType<
  (typeof client.api.stores)[":id"]["$delete"]
>;

export const getStores = async () => {
  const client = await getClient();
  const response = await client.api.stores.$get();

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getStore = async (id: any) => {
  const client = await getClient();
  const response = await client.api.stores[":id"].$get({
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

export const useGetStores = () => {
  return useQuery<GetRequestType, Error, GetResponseType>({
    queryKey: ["stores"],
    queryFn: async () => {
      const response = await client.api.stores.$get();

      const result = await response.json();

      if (!result.success) {
        throw result;
      }
      return result;
    },
  });
};
export const useGetStore = (id: any) => {
  return useQuery<GetSingleResponseType, Error, GetSingleRequestType>({
    queryKey: ["stores", id],
    queryFn: async () => {
      const response = await client.api.stores[":id"].$get({
        param: { id },
      });

      const result = await response.json();

      if (!result.success) {
        throw result;
      }
      return result;
    },
  });
};

export const useSwitchStore = (id: any) => {
  const queryClient = useQueryClient();
  return useMutation<SwitchResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.stores[":id"].$post({
        param: { id },
      });

      const result = await response.json();

      if (!result.success) {
        throw result;
      }
      return result;
    },
    onSuccess: ({ data }) => {
      toast.success(`Store "${data.name}"  selected`);
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useCreateStore = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.stores.$post({
        json,
      });

      const result = await response.json();

      if (!result.success) {
        throw result;
      }
      return result;
    },
    onSuccess: ({ data }) => toast.success(`Store "${data.name}" created`),
    onError: (error) => toast.error(error.message),
  });
};

export const useUpdateStore = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.stores[":id"].$put({
        param: { id },
        json,
      });

      const result = await response.json();

      if (!result.success) {
        throw result;
      }
      return result;
    },
    onSuccess: ({ data }) => toast.success(`Store "${data.name}" updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteStore = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.stores[":id"].$delete({
        param: { id },
      });

      const result = await response.json();

      if (!result.success) {
        throw result;
      }
      return result;
    },
    onSuccess: ({ data }) => toast.success(`Store "${data.name}" deleted`),
    onError: (error) => toast.error(error.message),
  });
};
