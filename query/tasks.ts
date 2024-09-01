import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.tasks)["$get"]>;

export type TaskType = Omit<ResponseType, "success">["data"][0];

type CreateTaskResponse = InferResponseType<typeof client.api.tasks.$post>;
type CreateTaskRequest = InferRequestType<
  typeof client.api.tasks.$post
>["json"];
type EditTaskResponse = InferResponseType<
  (typeof client.api.tasks)[":id"]["$put"]
>;
type EditTaskRequest = InferRequestType<
  (typeof client.api.tasks)[":id"]["$put"]
>["json"];

type UpdateTaskResponse = InferResponseType<
  (typeof client.api.tasks)[":id"][":action"]["$post"]
>;

type UpdateTaskRequest = InferRequestType<
  (typeof client.api.tasks)[":id"][":action"]["$post"]
>;

type DeleteResponseType = InferResponseType<
  (typeof client.api.tasks)[":id"]["$delete"]
>;

export const getTasks = async (query: Record<string, string>) => {
  const client = await getClient();
  const response = await client.api.tasks.$get({ query });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const getTask = async (id: string) => {
  const client = await getClient();
  const response = await client.api.tasks[":id"].$get({
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

export const useCreateTask = () => {
  return useMutation<CreateTaskResponse, Error, CreateTaskRequest>({
    mutationFn: async (json) => {
      const response = await client.api.tasks.$post({
        json,
      });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Task "${data.title}" created`),
    onError: (error) => toast.error(error.message),
  });
};

export const useEditTask = (id: string) => {
  return useMutation<EditTaskResponse, Error, EditTaskRequest>({
    mutationFn: async (json) => {
      const response = await client.api.tasks[":id"].$put({
        json,
        param: {
          id,
        },
      });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Task "${data.title}" updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const useUpdateTask = (id: string) => {
  let toastId = 1;
  return useMutation<UpdateTaskResponse, Error, string>({
    mutationFn: async (action) => {
      const response = await client.api.tasks[":id"][":action"].$post({
        param: {
          id,
          action,
        },
      });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onMutate: () => toast.loading("Please wait...", { id: toastId }),
    onSuccess: ({ data }) =>
      toast.success(`Task "${data.title}" updated`, { id: toastId }),
    onError: (error) => toast.error(error.message, { id: toastId }),
  });
};

export const useDeleteTask = (id: string) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.tasks[":id"].$delete({
        param: { id },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Task "${data.title}" deleted`),
    onError: (error) => toast.error(error.message),
  });
};
