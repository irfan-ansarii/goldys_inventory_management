import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCreateTransaction } from "@/query/orders";
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

interface Props {
  order: CreatedOrdertype;
  onNext: () => void;
  showSkip?: boolean;
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

const PaymentTab = ({ order, onNext, showSkip = true }: Props) => {
  const { data: payments, isLoading }: PaymentsData =
    useGetOption("order-payments");

  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactions: [],
    },
  });

  // create transaction hook
  let { mutate, isPending } = useCreateTransaction(order.id);

  const transactionKind = parseFloat(order.due) < 0 ? "refund" : "sale";

  // get received total
  const getPaymentValue = (index: number) => {
    const amount = parseFloat(form.watch(`transactions.${index}.amount`)!);
    if (!isNaN(amount)) return formatNumber(amount);
    return null;
  };

  // handle create transactions
  const onSubmit = (values: z.infer<typeof schema>) => {
    const { transactions } = values;

    const data = transactions
      .filter((txn) => parseFloat(txn.amount || "0") > 0)
      .map((txn) => ({
        ...txn,
        kind: transactionKind as "sale" | "refund",
      }));

    mutate(data, {
      onSuccess: (v) => {
        router.refresh();
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

        <div className="grid grid-cols-3 gap- divide-x mb-2 py-4 rounded-lg bg-gradient-to-b from-teal-600 to-indigo-900">
          {/* order total col */}
          <div className="px-4 space-y-1.5 text-center">
            <p className="font-semibold text-lg text-white">
              {formatNumber(order.total)}
            </p>
            <p className="text-zinc-300 text-sm">Total</p>
          </div>
          {/* paid by customer col */}
          <div className="px-4 space-y-1.5 text-center">
            <p className="font-semibold text-lg text-white">
              {formatNumber(
                Math.abs(parseFloat(order.total) - parseFloat(order.due))
              )}
            </p>
            <p className="text-zinc-300 text-sm">Paid</p>
          </div>

          {/* amount refund/due */}
          <div className="px-4 space-y-1.5 text-center">
            <p className="font-semibold text-lg text-white">
              {formatNumber(Math.abs(parseFloat(order.due)))}
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
                  className={`border rounded-lg py-1 ${
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
            <Button onClick={() => onNext()} type="button" variant="outline">
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
