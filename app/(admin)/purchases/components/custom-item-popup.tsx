import React, { useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormValues } from "./form";
import { Plus } from "lucide-react";

import Popup from "@/components/custom-ui/popup";
import Tooltip from "@/components/custom-ui/tooltip";
import { useForm, useFormContext } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

// schema to validate form
const schema = z.object({
  title: z.string().min(1, { message: "Required" }),
  price: z
    .string()
    .min(1, { message: "Required" })
    .refine((v) => !isNaN(parseInt(v)), { message: "Invalid value" }),
  taxRate: z
    .string()
    .min(1, { message: "Required" })
    .refine((v) => !isNaN(parseInt(v)), { message: "Invalid value" }),
});

// component
const CustomItemPopup = ({ calculateCart }: { calculateCart: () => void }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      price: "",
      taxRate: "",
    },
  });

  const formContext = useFormContext<OrderFormValues>();
  const cartLineItems = formContext.watch("lineItems");

  const onSubmit = (values: any) => {
    cartLineItems.push({
      title: values.title,
      price: values.price,
      variantTitle: "",
      purchasePrice: values.price,
      quantity: 1,
      taxRate: values.taxRate,
      discountLine: {
        type: "fixed",
        amount: "",
      },
    });
    formContext.setValue("lineItems", cartLineItems);
    calculateCart?.();
    setOpen(false);
    form.reset();
  };

  const disabled = !form.formState.isDirty;

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-2 md:p-6 space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Add Custom Item</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="justify-end flex flex-col gap-2 md:gap-4 md:flex-row">
              <Button type="submit" className="md:order-2" disabled={disabled}>
                Add Item
              </Button>
              <Button
                type="button"
                className="md:order-1"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      }
    >
      <span className="cursor-pointer">
        <Tooltip content="Add custom item">
          <span className="absolute right-0 inset-y-0 px-3  inline-flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </span>
        </Tooltip>
      </span>
    </Popup>
  );
};

export default CustomItemPopup;
