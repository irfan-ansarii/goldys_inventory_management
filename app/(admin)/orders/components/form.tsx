"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  lineItemCreateSchema,
  orderCreateSchema,
} from "@/drizzle/schemas/orders";
import { useForm, useWatch } from "react-hook-form";
import { useGetVariants } from "@/query/products";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import Popup from "@/components/custom-ui/popup";
import Pagination from "@/components/pagination";
import SkeletonLoading from "@/components/skeleton-loading";
import ErrorFallback from "@/components/error-fallback";

import OrderCart from "../components/order-cart";
import ProductCard from "../components/product-card";
import CustomItemPopup from "../components/custom-item-popup";
import useLocalStorage from "@/hooks/use-local-storage";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [progress, setProgress] = useState<
    (EventTarget & HTMLInputElement) | null
  >(null);

  const [cloneData, clearCloneData] = useLocalStorage("clone_data");

  const { data, isLoading, isError } = useGetVariants({ q: search, page });

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

  const itemsCount = cartLineItems?.reduce(
    (acc, curr) => (acc += curr.quantity!),
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

  // check if item is in cart to show active
  const isItemInCart = (id: number): boolean => {
    return cartLineItems.findIndex((i) => i.variantId === id) !== -1;
  };

  /** hanlde product search */
  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, currentTarget } = e;
    const { value } = currentTarget;

    if (key !== "Enter" || !value) return;
    if (progress) {
      toast.loading("Please wait...", { id: "toast" });
      return;
    }
    if (isLoading) setProgress(currentTarget);
  };

  useEffect(() => {
    if (!isLoading && progress) {
      const found = data?.data.find((item) => item.barcode === progress.value);

      if (found) {
        toast.success("Product found", { id: "toast" });
      } else {
        toast.error("Product not found", { id: "toast" });
      }
      progress.value = "";
      console.log("progress clered");
      setProgress(null);
    }
  }, [isLoading]);

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
          {/* search bar */}
          <div className="sticky top-[4.5rem] lg:top-6 z-10">
            <div className="relative">
              <span className="absolute left-0 inset-y-0 px-3 pointer-events-none inline-flex items-center justify-center">
                <Search className="w-4 h-4" />
              </span>
              <Input
                placeholder="Search..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
              {/* custom item popup */}
              <CustomItemPopup calculateCart={calculateCart} />
            </div>
          </div>

          {/* products */}
          <div className="flex-1 space-y-2">
            {isLoading ? (
              <SkeletonLoading />
            ) : isError ? (
              <ErrorFallback />
            ) : (
              data?.data?.map((variant, i) => (
                <ProductCard
                  key={i}
                  variant={variant}
                  isActive={isItemInCart(variant.id)}
                  calculateCart={calculateCart}
                />
              ))
            )}
          </div>
          {/* pagination */}
          {data && <Pagination meta={data.meta} onChange={setPage} />}
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
