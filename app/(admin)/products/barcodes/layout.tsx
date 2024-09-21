"use client";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";

import {
  Check,
  ChevronDown,
  ListFilter,
  Loader,
  PlusCircle,
  Printer,
} from "lucide-react";

import { useBulkPrintBarcode } from "@/query/barcodes";

import SearchBar from "@/components/search-bar";
import Popup from "@/components/custom-ui/popup";
import Navigation from "../components/navigation";
import BarcodePopup from "../components/barcode-popup";
import { toast } from "sonner";
import { useRouterStuff } from "@/hooks/use-router-stuff";
import Link from "next/link";

const types = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Printed", value: "printed" },
  { label: "Cancelled", value: "cancelled" },
];

const BarcodesLayout = ({ children }: { children: React.ReactNode }) => {
  const { mutate, isPending } = useBulkPrintBarcode();
  const { queryParams, searchParamsObj } = useRouterStuff();
  const handlePrint = () => {
    const id = toast.loading("Please wait...", {
      duration: Infinity,
    });

    mutate(undefined, {
      onSuccess: ({ url }) => {
        toast.dismiss(id);
        window.open(url, "_blank");
      },
      onError: () => toast.dismiss(id),
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row md:col-span-3 mb-6">
        <div className="space-y-1">
          <CardTitle>Barcodes</CardTitle>
          <CardDescription className="leading-non">
            View and manage product barcodes
          </CardDescription>
        </div>
        <div className="sm:ml-auto mt-3 sm:mt-0 [&>*]:flex-1 flex gap-2 ">
          <Button
            className="min-w-32"
            variant="outline"
            onClick={handlePrint}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </>
            )}
          </Button>
          <BarcodePopup>
            <Button className="min-w-32">
              <PlusCircle className="w-4 h-4 mr-2" /> Add to Print List
            </Button>
          </BarcodePopup>
        </div>
      </div>
      <Navigation />
      <div className="flex flex-col md:flex-row mb-6 justify-end gap-2">
        <Popup
          content={
            <div className="md:w-44 space-y-1 [&>*]:justify-start [&>*]:w-full">
              {types.map((type) => (
                <Link
                  key={type.value}
                  href={
                    queryParams({
                      ...(type.value === ""
                        ? { del: "status" }
                        : { set: { status: type.value } }),
                      getNewPath: true,
                    }) as string
                  }
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: `${
                      (searchParamsObj.status || "") === type.value
                        ? "!bg-accent [&>svg]:opacity-100"
                        : ""
                    }`,
                  })}
                >
                  {type.label}
                  <Check className="w-4 h-4 ml-auto opacity-0" />
                </Link>
              ))}
            </div>
          }
          variant="popover"
        >
          <Button
            className="justify-between md:w-48 md:order-3"
            variant="outline"
          >
            <span className="inline-flex items-center">
              <ListFilter className="w-4 h-4 mr-2" />
              {
                types.find((t) => t.value === (searchParamsObj.status || ""))
                  ?.label
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

export default BarcodesLayout;
