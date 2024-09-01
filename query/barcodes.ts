import { getClient } from "@/lib/hono-server";
import { client } from "@/lib/hono-client";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { generateBarcode, initializePdf } from "@/lib/generate-barcode";

type ResponseType = InferResponseType<
  (typeof client.api.barcodes)[":id"]["$get"]
>;

export type BarcodeType = Omit<ResponseType, "success">["data"];

type CreateResponseType = InferResponseType<typeof client.api.barcodes.$post>;
type CreateRequestType = InferRequestType<
  typeof client.api.barcodes.$post
>["json"];

type UpdateResponseType = InferResponseType<
  (typeof client.api.barcodes)[":id"]["$put"]
>;
type UpdateRequestType = InferRequestType<
  (typeof client.api.barcodes)[":id"]["$put"]
>["json"];

type DeleteResponseType = InferResponseType<
  (typeof client.api.barcodes)[":id"]["$delete"]
>;

type BlukPrintRequestType = InferRequestType<
  typeof client.api.barcodes.print.$post
>["json"];

export const getBarcodes = async (query: Record<string, any>) => {
  const client = await getClient();
  const response = await client.api.barcodes.$get({
    query: query,
  });

  const result = await response.json();

  if (!result.success) {
    throw result;
  }
  return result;
};

export const useCreateBarcode = () => {
  return useMutation<CreateResponseType, Error, CreateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.barcodes.$post({ json });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success(`Product added`),
    onError: (error) => toast.error(error.message),
  });
};

export const useUpdateBarcode = (id: any) => {
  return useMutation<UpdateResponseType, Error, UpdateRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.barcodes[":id"].$put({
        json,
        param: { id },
      });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success(`Barcode updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteBarcode = (id: any) => {
  return useMutation<DeleteResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.barcodes[":id"].$delete({
        param: {
          id,
        },
      });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`Barcode updated`),
    onError: (error) => toast.error(error.message),
  });
};

export const usePrintBarcode = () => {
  return useMutation<{ url: URL }, Error, BlukPrintRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.barcodes["print"].$post({
        json,
      });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;

      const { doc, config } = await initializePdf();

      const labelItems = jsonResponse.data.map((item: any) => ({
        ...item,
        price: parseFloat(item.salePrice!).toFixed(2),
      }));

      await generateBarcode(doc, config, labelItems);

      const url = doc.output("bloburi");
      return { url };
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useBulkPrintBarcode = () => {
  return useMutation<{ url: URL }, Error>({
    mutationFn: async () => {
      const response = await client.api.barcodes["bulk-print"].$post();

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;

      const { doc, config } = await initializePdf();

      const labelItems = jsonResponse.data.map((item: any) => ({
        ...item,
        price: parseFloat(item.salePrice!).toFixed(2),
      }));

      await generateBarcode(doc, config, labelItems);

      const url = doc.output("bloburi");
      return { url };
    },
    onError: (error) => toast.error(error.message),
  });
};
