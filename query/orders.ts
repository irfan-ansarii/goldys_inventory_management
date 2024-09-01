import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

export type OrderType = InferResponseType<
  (typeof client.api.orders)[":id"]["$get"]
>["data"];

type ShipmentResponse = InferResponseType<
  (typeof client.api.orders)[":id"]["$get"]
>["data"]["shipments"][0];

export type ShipmentType = Omit<ShipmentResponse, "actions"> & {
  actions: string[];
};

type CreateResponseType = InferResponseType<typeof client.api.orders.$post>;
type CreateRequestType = InferRequestType<
  typeof client.api.orders.$post
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["$delete"]
>;

type TransactionCreateResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["transactions"]["$post"]
>;
type TransactionCreateRequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["transactions"]["$post"]
>["json"];

type InvoiceResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["invoice"][":action"]["$post"]
>;

// get orders
export const getOrders = async (query: Record<string, string>) => {
  const client = await getClient();
  const response = await client.api.orders.$get({ query });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

// get order
export const getOrder = async (id: any) => {
  const client = await getClient();
  const response = await client.api.orders[":id"].$get({
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
export const getTransactions = async (orderId: any) => {
  const client = await getClient();
  const response = await client.api.orders[":id"].transactions.$get({
    param: { id: orderId },
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

/** create order */
export const useCreateOrder = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.orders.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Order ${data.name} created`),
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/** update order */
export const useUpdateOrder = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.orders[":id"].$put({
        param: { id },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Order ${data.name} updated`),
    onError: (error) => toast.error(error.message),
  });
};

/** delete order */
export const useDeleteOrder = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.orders[":id"].$delete({
        param: {
          id,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Order ${data.name} deleted`),
    onError: (error) => toast.error(error.message),
  });
};

/** create transaction */
export const useCreateTransaction = (id: any) => {
  return useMutation<
    TransactionCreateResponseType,
    Error,
    TransactionCreateRequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.orders[":id"].transactions.$post({
        param: {
          id,
        },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.error("Transaction created"),
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/** invoice */
export const useInvoiceAction = (id: string) => {
  return useMutation<InvoiceResponseType, Error, string>({
    mutationFn: async (action) => {
      const response = await client.api.orders[":id"]["invoice"][
        ":action"
      ].$post({
        param: {
          id,
          action,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
  });
};

type ShipmentResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["shipments"]["$post"]
>;
type ShipmentRequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["shipments"]["$post"]
>["json"];

export const useProcessOrder = (id: string) => {
  return useMutation<ShipmentResponseType, Error, ShipmentRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.orders[":id"]["shipments"].$post({
        param: {
          id,
        },
        json,
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success("Order processed"),
    onError: (error) => toast.error(error.message),
  });
};

type ShipmentReturnResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["shipments"][":shipmentId"]["$post"]
>;
type ShipmentReturnRequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["shipments"][":shipmentId"]["$post"]
>["json"];

export const useCreateReturn = ({
  orderId,
  shipmentId,
}: Record<string, any>) => {
  return useMutation<
    ShipmentReturnResponseType,
    Error,
    ShipmentReturnRequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.orders[":id"]["shipments"][
        ":shipmentId"
      ].$post({ param: { id: orderId, shipmentId }, json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success("Return initiated"),
    onError: (error) => toast.error(error.message),
  });
};

type ShipmentEditResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["shipments"][":shipmentId"][":action"]["$put"]
>;

type ShipmentEditRequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["shipments"][":shipmentId"][":action"]["$put"]
>["json"];

export const useEditShipment = ({
  orderId,
  shipmentId,
  action,
}: Record<string, any>) => {
  return useMutation<ShipmentEditResponseType, Error, ShipmentEditRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.orders[":id"]["shipments"][
        ":shipmentId"
      ][":action"].$put({ param: { id: orderId, shipmentId, action }, json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success("Shipment updated"),
    onError: (error) => toast.error(error.message),
  });
};

type ShipmentCancelResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["shipments"][":shipmentId"]["$delete"]
>;

type ShipmentCancelRequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["shipments"][":shipmentId"]["$delete"]
>;

export const useCancelShipment = ({
  orderId,
  shipmentId,
}: Record<string, any>) => {
  return useMutation<ShipmentCancelResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.orders[":id"]["shipments"][
        ":shipmentId"
      ].$delete({ param: { id: orderId, shipmentId } });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success("Shipment cancelled"),
    onError: (error) => toast.error(error.message),
  });
};
