import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GLOBAL_ERROR } from "@/lib/utils";
import { toast } from "sonner";

type SessionResponseType = InferResponseType<typeof client.api.users.me.$get>;

export type SessionType = Omit<SessionResponseType, "success">["data"];

type UserResponseType = InferResponseType<
  (typeof client.api.users)[":id"]["$get"]
>;
export type UserType = Omit<UserResponseType, "success">["data"];

type GetResponseType = InferResponseType<typeof client.api.users.$get>;
type GetRequestType = InferRequestType<typeof client.api.users.$get>;

type CreateResponseType = InferResponseType<typeof client.api.users.$post>;
export type CreateRequestType = InferRequestType<
  typeof client.api.users.$post
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.users)[":id"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.users)[":id"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.users)[":id"]["$delete"]
>;

export const getUsers = async (query: Record<string, any>) => {
  const client = await getClient();

  const response = await client.api.users.$get({
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

export const getUser = async (id: any) => {
  const client = await getClient();
  const response = await client.api.users[":id"].$get({
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

export const getSession = async () => {
  const client = await getClient();
  const response = await client.api.users.me.$get();

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const useSession = () => {
  return useQuery<SessionResponseType, Error>({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await client.api.users.me.$get();

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
  });
};

export const useUsersData = (query: Record<string, any>) => {
  return useQuery<GetRequestType, Error, GetResponseType>({
    queryKey: ["users", query],
    queryFn: async () => {
      const response = await client.api.users.$get({
        query,
      });

      if (!response.ok) throw GLOBAL_ERROR;
      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
  });
};

export const useCreateUser = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.users.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`User ${data.name} created`),
    onError: (error) => toast.error(error.message),
  });
};

export const useUpdateUser = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.users[":id"].$put({
        param: { id },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`User ${data.name} updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteUser = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.users[":id"].$delete({
        param: {
          id,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`User ${data.name} deleted`),
    onError: (error) => toast.error(error.message),
  });
};
