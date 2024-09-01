"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Popup from "@/components/custom-ui/popup";

const schema = z.object({
  name: z.string().default(""),
  key: z.string().default(""),
});

type FormValues = z.infer<typeof schema>;

const PaymentPopup = ({
  values,
  children,
  onSubmit,
}: {
  values?: { name: string; key: string };
  children: React.ReactNode;
  onSubmit: (v: FormValues) => void;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: values ? values : { name: "", key: "" },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    setOpen(false);
    form.reset();
  };

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (e) => console.log(e))}
            className="p-2 md:p-6 flex flex-col gap-6"
          >
            <DialogHeader>
              <DialogTitle>
                {values ? "Update" : "Add"} Payment Mode
              </DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button>Save</Button>
          </form>
        </Form>
      }
    >
      {children}
    </Popup>
  );
};

export default PaymentPopup;
