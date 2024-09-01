import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

import { useGetOption } from "@/query/options";
import { useForm } from "react-hook-form";

import { formatNumber } from "@/lib/utils";
import { ArrowRight, Loader } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PopupLoading from "@/components/popup-loading";
import { CreatedOrdertype } from "./checkout-popup";
import { useCreatePurchaseTransaction } from "@/query/purchase";

interface Props {
  purchase: CreatedOrdertype;
  showSkip?: boolean;
  onNext: () => void;
}

interface Payment {
  name: string;
  key: string;
}

interface PaymentsData {
  data:
    | {
        data: Payment[];
      }
    | undefined;
  isLoading: boolean;
}

// form schema
const schema = z.object({
  transactions: z
    .object({
      name: z.string().min(1),
      amount: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) || !val, {
          message: "Enter valid number",
        })
        .optional(),
    })
    .array(),
});
type FormValues = z.infer<typeof schema>;

const PaymentTab = ({ purchase, showSkip = true, onNext }: Props) => {
  const { data: payments, isLoading }: PaymentsData =
    useGetOption("purchase-payments");

  // initialize form
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactions: [],
    },
  });

  // create transaction hook
  let { mutate, isPending } = useCreatePurchaseTransaction(purchase.id);

  const transactionKind = parseFloat(purchase.due) < 0 ? "refund" : "paid";

  // get received total
  const getPaymentValue = (index: number) => {
    const amount = parseFloat(form.watch(`transactions.${index}.amount`)!);
    if (!isNaN(amount)) return formatNumber(amount);
    return null;
  };

  const onSubmit = (values: FormValues) => {
    const { transactions } = values;

    const data = transactions
      .filter((txn) => parseFloat(txn.amount || "0") > 0)
      .map((txn) => ({
        ...txn,
        kind: transactionKind as "paid" | "refund",
      }));

    mutate(data, {
      onSuccess: (v) => {
        onNext();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader className="md:mb-3">
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap- divide-x mb-2 py-4 rounded-md bg-gradient-to-b from-teal-600 to-zinc-900">
          {/* purchsase total col */}
          <div className="px-4 space-y-1.5 text-center">
            <p className="font-semibold text-lg text-white">
              {formatNumber(purchase.total)}
            </p>
            <p className="text-zinc-300 text-sm">Total</p>
          </div>
          {/* paid by customer col */}
          <div className="px-4 space-y-1.5 text-center">
            <p className="font-semibold text-lg text-white">
              {formatNumber(
                Math.abs(parseFloat(purchase.total) - parseFloat(purchase.due))
              )}
            </p>
            <p className="text-zinc-300 text-sm">Paid</p>
          </div>

          {/* amount refund/due */}
          <div className="px-4 space-y-1.5 text-center">
            <p className="font-semibold text-lg text-white">
              {formatNumber(Math.abs(parseFloat(purchase.due)))}
            </p>
            <p className="text-zinc-300 text-sm">
              {transactionKind === "refund" ? "Refund Due" : "Due"}
            </p>
          </div>
        </div>

        <div className="h-full overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              <PopupLoading />
            </div>
          ) : (
            // transactionKind==='refund' render refund modes else render
            <Accordion type="single" collapsible className="w-full space-y-2">
              {payments?.data?.map((payment, i) => (
                <AccordionItem
                  value={payment.key}
                  key={payment.key}
                  className={`border rounded-md ${
                    form.formState.errors.transactions?.[i]?.amount
                      ? "border-destructive"
                      : ""
                  }`}
                >
                  <AccordionTrigger className="[&>svg]:-rotate-90 rounded-lg [&[data-state=open]>svg]:rotate-0 hover:no-underline p-4 [&[data-state=open]]:pb-3">
                    <Label className="cursor-pointer font-semibold flex flex-1">
                      {payment.name}
                      <span className="ml-auto pr-2">{getPaymentValue(i)}</span>
                    </Label>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-3">
                    <Input
                      className="hidden"
                      {...form.register(`transactions.${i}.name`, {
                        value: payment.name,
                      })}
                    />
                    <FormField
                      control={form.control}
                      name={`transactions.${i}.amount`}
                      defaultValue=""
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <div className="flex [&>*]:flex-1 gap-2">
          {showSkip && (
            <Button onClick={() => onNext()} type="button">
              Skip
            </Button>
          )}

          <Button type="submit" disabled={isPending} className="flex-none">
            {isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : showSkip ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentTab;
