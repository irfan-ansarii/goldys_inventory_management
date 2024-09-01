"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import React, { useState } from "react";

import { EllipsisVertical, Loader, Pencil } from "lucide-react";

import {
  BarcodeType,
  useDeleteBarcode,
  useUpdateBarcode,
} from "@/query/barcodes";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import Popup from "@/components/custom-ui/popup";
import DeletePopup from "@/components/delete-popup";
import { DialogTitle } from "@/components/ui/dialog";

const schema = z.object({
  quantity: z.string().min(1, {
    message: "Required",
  }),
  status: z.string().min(1, {
    message: "Required",
  }),
});

type FormValues = z.infer<typeof schema>;
const BarcodeActions = ({ data }: { data: BarcodeType }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const router = useRouter();
  const remove = useDeleteBarcode(data.id);
  const update = useUpdateBarcode(data.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: data.status!,
      quantity: data.quantity?.toString(),
    },
  });

  // remove barcode
  const onRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.refresh();
      },
    });
  };

  // update barcode
  const onSubmit = (values: FormValues) => {
    update.mutate(
      {
        ...values,
        quantity: parseInt(values.quantity),
      },
      {
        onSuccess: () => {
          setUpdateOpen(false);
          router.refresh();
        },
      }
    );
  };

  return (
    <Popup
      variant="popover"
      content={
        <div className="md:w-44 flex flex-col [&>*]:justify-start">
          <Popup
            open={updateOpen}
            onOpenChange={setUpdateOpen}
            content={
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6 p-2 md:p-6"
                >
                  <DialogTitle>Update Barcode</DialogTitle>
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={update.isPending}>
                    {update.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </form>
              </Form>
            }
          >
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Popup>
          <DeletePopup
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onDelete={onRemove}
            loading={remove.isPending}
          />
        </div>
      }
    >
      <Button variant="ghost" className="px-2">
        <EllipsisVertical className="w-5 h-5" />
      </Button>
    </Popup>
  );
};

export default BarcodeActions;
