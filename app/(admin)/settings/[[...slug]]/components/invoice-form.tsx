"use client";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { useUpdateOption } from "@/query/options";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader, Plus, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const schema = z.object({
  prefix: z.string().default(""),
  suffix: z.string().default(""),
  conditions: z.string().array().min(1),
  footer: z.string().array().min(1).max(3),
});

type FormValues = z.infer<typeof schema>;
const InvoiceForm = ({ defaultValues }: { defaultValues: FormValues }) => {
  const { mutate, isPending } = useUpdateOption("invoice");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? defaultValues
      : {
          prefix: "",
          suffix: "",
          conditions: [],
          footer: [],
        },
  });

  const conditions = form.watch("conditions");
  const footer = form.watch("footer");

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prefix</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="suffix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suffix</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="font-semibold my-6">Terms & Conditions</p>
        {conditions?.map((con, i) => (
          <div className="flex gap-4" key={i}>
            <Input {...form.register(`conditions.${i}`)} />
            <Button
              className="px-2"
              type="button"
              variant="secondary"
              disabled={conditions.length === 1}
              onClick={() => {
                conditions.splice(i, 1);
                form.setValue("conditions", conditions);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          className="w-full"
          type="button"
          variant="secondary"
          onClick={() => {
            conditions.push("");
            form.setValue("conditions", conditions);
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add New
        </Button>

        <p className="font-semibold my-6">Footer</p>
        {footer?.map((con, i) => (
          <div className="flex gap-4" key={i}>
            <Input {...form.register(`footer.${i}`)} />
            <Button
              className="px-2"
              type="button"
              variant="secondary"
              disabled={footer.length === 1}
              onClick={() => {
                footer.splice(i, 1);
                form.setValue("footer", footer);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          className="w-full"
          type="button"
          variant="secondary"
          disabled={footer.length >= 3}
          onClick={() => {
            footer.push("");
            form.setValue("footer", footer);
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add New
        </Button>
        <Button className="float-right w-28">
          {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </form>
    </Form>
  );
};

export default InvoiceForm;
