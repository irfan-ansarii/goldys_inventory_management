"use client";
import React, { useState } from "react";
import { Loader, Trash2 } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateBarcode, usePrintBarcode } from "@/query/barcodes";
import { getVariants } from "@/query/products";
import { useRouter } from "next/navigation";

import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import Popup from "@/components/custom-ui/popup";
import Avatar from "@/components/custom-ui/avatar";
import AsyncSelect from "react-select/async";

const schema = z.object({
  lineItems: z
    .object({
      productId: z.number(),
      variantId: z.number(),
      barcode: z.string(),
      title: z.string(),
      variantTitle: z.string(),
      quantity: z
        .string()
        .refine((arg) => !isNaN(parseInt(arg)), { message: "Invalid value" }),
      value: z.number(),
      image: z.string().nullable(),
    })
    .array()
    .min(1),
});

type FormValues = z.infer<typeof schema>;
type Selected = Omit<FormValues, "destination">["lineItems"][0];

const BarcodePopup = ({
  children,
  defaultValues,
  action,
}: {
  children: React.ReactNode;
  defaultValues?: FormValues["lineItems"];
  action?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Selected | null>(null);

  const router = useRouter();
  const create = useCreateBarcode();
  const print = usePrintBarcode();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lineItems: defaultValues || [],
    },
  });

  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const isError = form.formState.errors?.lineItems?.message;

  const options = async (input: string) => {
    const { data } = await getVariants({ q: input });

    return data.map((item) => ({
      productId: item.productId!,
      variantId: item.id!,
      title: item?.product?.title,
      variantTitle: item.title!,
      barcode: item.barcode!,
      image: item?.product?.image,
      value: item.id!,
    }));
  };

  const handleSelect = (selected: Selected | null) => {
    if (!selected) return;
    const index = fields.findIndex((field) => field.value === selected.value);
    if (index == -1) append({ ...selected, quantity: "1" });
    else {
      const q = form.watch(`lineItems.${index}.quantity`);
      update(index, {
        productId: selected.productId,
        variantId: selected.variantId,
        title: selected.title,
        variantTitle: selected.variantTitle,
        barcode: selected.barcode,
        image: selected.image,
        value: selected.value,
        quantity: (parseInt(q) + 1).toString(),
      });
    }
    setValue(null);
  };

  const onSubmit = (values: FormValues) => {
    const lineItems = values.lineItems.map((item) => ({
      ...item,
      quantity: parseInt(item.quantity),
    }));

    // print
    if (action === "print") {
      print.mutate(
        { lineItems },
        {
          onSuccess: ({ url }) => {
            window.open(url, "_blank");
            setOpen(false);
          },
        }
      );
      return;
    }

    create.mutate(
      { lineItems },
      {
        onSuccess: () => {
          router.refresh();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-2 md:p-6 flex flex-col"
          >
            <DialogTitle className="mb-6">
              {action === "print"
                ? "Print barcode"
                : "Add Product to Print List"}
            </DialogTitle>

            <AsyncSelect
              defaultOptions
              // @ts-ignore
              loadOptions={options}
              onChange={handleSelect}
              unstyled
              value={value}
              placeholder="Search or scan barcode..."
              loadingMessage={() => (
                <div className="flex items-center justify-center h-20">
                  <Loader className="w-4 h-4 animate-spin" />
                </div>
              )}
              classNames={{
                control: ({ isFocused }) =>
                  cn(
                    "text-sm h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background",
                    isFocused && "ring-2 ring-offset-2 ring-ring",
                    isError && "border-destructive"
                  ),
                placeholder: () => "text-muted-foreground",
                menu: () => "p-2 bg-background rounded-md border shadow-sm",
                menuList: () => "overflow-y-scroll max-h-72 space-y-1",
                option: ({ isFocused }) =>
                  cn(
                    "!flex items-center justify-start rounded-md text-sm font-medium transition-colors h-auto px-2 py-1",
                    isFocused && "bg-accent/70 text-accent-foreground"
                  ),
              }}
              formatOptionLabel={({ title, variantTitle, image }) => (
                <>
                  <Avatar src={image || title} className="mr-2" />

                  <div className="space-y-0.5">
                    <p className="text-sm">{title}</p>
                    <Badge variant="secondary" className="py-0">
                      {variantTitle}
                    </Badge>
                  </div>
                </>
              )}
            />

            <div className="h-[28rem] overflow-y-scroll divide-y">
              {/* line items required error */}
              {isError ? (
                <p className="text-sm font-medium text-destructive mt-2">
                  Required
                </p>
              ) : null}

              {fields.map((field, i) => (
                <div
                  className="py-2 grid grid-cols-3 gap-2 first:mt-4"
                  key={field.id}
                >
                  <div className="flex items-start gap-2 col-span-2 overflow-hidden">
                    <Avatar
                      src={field.image || field.title!}
                      className="mr-2"
                    />
                    <div className="overflow-hidden">
                      <p className="text-sm leading-tight truncate">
                        {field.title}
                      </p>

                      <Badge variant="secondary" className="py-0">
                        {field.variantTitle}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-auto space-x-2 flex">
                    <div className="relative ml-auto max-w-24">
                      <Input
                        placeholder="0"
                        {...form.register(`lineItems.${i}.quantity`)}
                      />
                    </div>

                    <Button
                      variant="secondary"
                      className="w-auto px-2 text-muted-foreground"
                      size="icon"
                      type="button"
                      onClick={() => remove(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={create.isPending || print.isPending}
            >
              {create.isPending || print.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      }
    >
      {children}
    </Popup>
  );
};

export default BarcodePopup;
