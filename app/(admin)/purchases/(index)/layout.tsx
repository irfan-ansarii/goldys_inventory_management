"use client";
import React from "react";
import Link from "next/link";
import Popup from "@/components/custom-ui/popup";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, ListFilter, PlusCircle } from "lucide-react";

import SearchBar from "@/components/search-bar";
import { useRouterStuff } from "@/hooks/use-router-stuff";

const paymentStatus = [
  { label: "All", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Overpaid", value: "overpaid" },
  { label: "Partially Paid", value: "partially paid" },
  { label: "Refunded", value: "refunded" },
];

const PurchaseLayout = ({ children }: { children: React.ReactNode }) => {
  const { queryParams, searchParamsObj } = useRouterStuff();
  return (
    <>
      <div className="mb-6 flex">
        <div className="space-y-1">
          <CardTitle>Purchases</CardTitle>
          <CardDescription>View and manage your orders.</CardDescription>
        </div>
        <Link
          href="/purchases/new"
          className={buttonVariants({ className: "ml-auto min-w-48" })}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add Purchase
        </Link>
      </div>

      <div className="gap-1 mb-6 bg-secondary rounded-md p-1 hidden md:flex">
        {paymentStatus.map((path) => (
          <Link
            key={path.value}
            href={
              queryParams({
                set: { status: path.value },
                getNewPath: true,
              }) as string
            }
            className={buttonVariants({
              variant:
                (searchParamsObj.status || "") === path.value
                  ? "outline"
                  : "ghost",
              size: "sm",
              className: "",
            })}
          >
            {path.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-col md:flex-row mb-6 justify-end gap-2">
        <Popup
          content={
            <div className="flex flex-col [&>*]:justify-start">
              {paymentStatus.map((path) => (
                <Link
                  key={path.value}
                  href={
                    queryParams({
                      set: { paymentStatus: path.value },
                      getNewPath: true,
                    }) as string
                  }
                  className={buttonVariants({
                    variant:
                      (searchParamsObj.paymentStatus || "") === path.value
                        ? "secondary"
                        : "ghost",
                    size: "sm",
                  })}
                >
                  {path.label}
                  <Check
                    className={`w-4 h-4 text-muted-foreground ml-auto ${
                      (searchParamsObj.paymentStatus || "") === path.value
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </Link>
              ))}
            </div>
          }
          variant="popover"
        >
          <Button className="justify-between md:hidden" variant="outline">
            <span className="inline-flex items-center">
              <ListFilter className="w-4 h-4 mr-2" />

              {
                paymentStatus.find(
                  (i) => i.value === (searchParamsObj.paymentStatus || "")
                )?.label
              }
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </Popup>
        <SearchBar containerClassName="flex-1 md:order-1" />
      </div>
      {children}
    </>
  );
};

export default PurchaseLayout;
