"use client";

import { z } from "zod";
import React, { useState } from "react";
import { Loader } from "lucide-react";
import Popup from "@/components/custom-ui/popup";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateExpense, useUpdateExpense } from "@/query/expenses";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "@/lib/utils";

const schema = z.object({
  id: z.any(),
  title: z.string().min(1, { message: "Required" }),
  category: z.string().min(1, { message: "Required" }),
  amount: z
    .string()
    .refine((arg) => !isNaN(parseInt(arg)) && parseInt(arg) > 0, {
      message: "Invalid value",
    }),

  createdAt: z.string(),
  notes: z.string(),
});

type FormValue = z.infer<typeof schema>;

interface Props {
  children: React.ReactNode;
  defaultValue: FormValue;
}

const ExpensePopup: React.FC<Props> = ({ children, defaultValue }) => {
  const [open, setOpen] = useState(false);
  const [calenderOpen, setCalenderOpen] = useState(false);

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense(defaultValue.id);

  const router = useRouter();
  const form = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: defaultValue,
  });

  const onSubmit = (values: FormValue) => {
    if (defaultValue.id) {
      updateExpense.mutate(values, {
        onSuccess: () => {
          router.refresh();
          setOpen(false);
        },
      });
    } else {
      createExpense.mutate(values, {
        onSuccess: () => {
          router.refresh();
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-2 md:p-6 flex flex-col gap-6"
          >
            <DialogHeader>
              <DialogTitle>
                {defaultValue.id ? "Update" : "Add"} Expense
              </DialogTitle>
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem value={cat} key={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popup
                    open={calenderOpen}
                    onOpenChange={setCalenderOpen}
                    variant="popover"
                    content={
                      <Calendar
                        mode="single"
                        selected={new Date(field.value)}
                        onSelect={(v) => {
                          setCalenderOpen(false);
                          const value = format(v!, "yyyy-MM-dd");
                          field.onChange(new Date(value).toISOString());
                        }}
                        initialFocus
                      />
                    }
                  >
                    <FormControl>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        {format(field.value, "MMM dd, yyyy")}
                      </Button>
                    </FormControl>
                  </Popup>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type additional description here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createExpense.isPending || updateExpense.isPending}
            >
              {createExpense.isPending || updateExpense.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
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

export default ExpensePopup;
