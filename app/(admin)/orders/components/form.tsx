"use client";
import React, { useEffect } from "react";
import { z } from "zod";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  lineItemCreateSchema,
  orderCreateSchema,
} from "@/drizzle/schemas/orders";
import { useForm, useWatch } from "react-hook-form";
import useLocalStorage from "@/hooks/use-local-storage";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

import Popup from "@/components/custom-ui/popup";
import OrderCart from "../components/order-cart";
import ProductsCard from "./products-card";

const lineItemSchema = lineItemCreateSchema
  .omit({
    id: true,
    storeId: true,
    orderId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    lineItemId: z.number().optional(),
    discountLine: z.object({
      type: z.string(),
      amount: z.string(),
    }),
  });

const schema = orderCreateSchema
  .omit({
    storeId: true,
    paymentStatus: true,
    shipmentStatus: true,
    cancelReason: true,
    createdBy: true,
    updatedBy: true,
    cancelledAt: true,
    updatedAt: true,
    taxLines: true,
  })
  .extend({
    lineItems: lineItemSchema.array(),
    charges: z.object({
      reason: z.any(),
      amount: z.any(),
    }),
    discountLines: z.object({
      type: z.string(),
      reason: z.string(),
      amount: z.string(),
    }),
    taxKind: z.object({
      type: z.string(),
      saleType: z.string(),
    }),
    tags: z.string().array().optional(),
    name: z.string().optional(),
  });

export type OrderFormValues = z.infer<typeof schema>;

type LineProps = {
  salePrice: string;
  quantity: number;
  currentQuantity: number;
  taxRate: any;
};
type WatchProps = [string, string, string, string, string, string, string];

const OrderForm = ({ defaultValues }: any) => {
  const pathname = usePathname();

  const [cloneData, clearCloneData] = useLocalStorage("clone_data");
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? defaultValues
      : {
          lineItems: [],
          transactions: [],
          discountLines: { type: "fixed", reason: "", amount: "" },
          taxKind: {
            type: "included",
            saleType: "state",
          },
        },
  });

  const { getValues, control, setValue, watch } = form;

  const watchValues = useWatch<OrderFormValues>({
    control,
    name: [
      "discountLines.type",
      "discountLines.reason",
      "discountLines.amount",
      "taxKind.type",
      "taxKind.saleType",
      "charges.reason",
      "charges.amount",
    ],
    exact: true,
  });

  const cartLineItems = watch("lineItems");
  console.log(cartLineItems);
  const itemsCount = cartLineItems?.reduce(
    (acc, curr) => (acc += curr.currentQuantity!),
    0
  );

  // calculate cart
  const calculateCart = () => {
    const cartLineItems = getValues("lineItems");

    const [dType, dReason, dAmount, tType, sType, cReason, cAmount] =
      watchValues as WatchProps;

    // update the line items and return the calculated cart total
    const totals = cartLineItems.reduce(
      (acc, curr, i) => {
        const { salePrice, currentQuantity, taxRate } = curr as LineProps;

        const lineSubtotal = parseFloat(salePrice!) * currentQuantity!;

        const isTaxIncluded = tType === "included";
        const lineTax = isTaxIncluded
          ? lineSubtotal - lineSubtotal / (1 + taxRate! / 100)
          : lineSubtotal * (taxRate! / 100);

        setValue(`lineItems.${i}.subtotal`, lineSubtotal.toString());

        setValue(`lineItems.${i}.tax`, lineTax.toString());
        setValue(`lineItems.${i}.total`, lineSubtotal.toString());

        acc.subtotal += lineSubtotal;
        acc.tax += lineTax;
        acc.total = acc.subtotal + (!isTaxIncluded ? acc.tax : 0);

        return acc;
      },
      {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
      }
    );

    totals.total = totals.total + parseFloat(cAmount || "0");

    // update the cart total fields
    Object.entries(totals).map(([key, value]) => {
      setValue(key as keyof typeof totals, value.toString() as any);
    });
  };

  useEffect(() => {
    calculateCart();
  }, [watchValues]);

  useEffect(() => {
    if (pathname === "/orders/new" && cloneData) {
      // @ts-ignore
      form.reset({ lineItems: cloneData });
      clearCloneData(undefined);
    }
  }, []);

  return (
    <Form {...form}>
      <div className="grid grid-cols-5 gap-6 h-full">
        <div className="col-span-5 lg:col-span-3 space-y-4 flex flex-col">
          <ProductsCard calculateCart={calculateCart} />
        </div>
        <div className="col-span-2 hidden lg:block">
          <Card className="h-full sticky top-6 max-h-[calc(100vh-3rem)] bg-secondary">
            <OrderCart calculateCart={calculateCart} />
          </Card>
        </div>

        <Popup
          content={
            <OrderCart
              className="p-2 h-[80vh] md:p-4"
              calculateCart={calculateCart}
            />
          }
        >
          <Button className="fixed lg:hidden bottom-[4.5rem] right-4 gap-2 bg-lime-500">
            <ShoppingBag className="w-4 h-4 " /> Cart ({itemsCount})
          </Button>
        </Popup>
      </div>
    </Form>
  );
};

export default OrderForm;
