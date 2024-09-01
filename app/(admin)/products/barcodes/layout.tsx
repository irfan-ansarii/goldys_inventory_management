"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";

import {
  ChevronDown,
  Filter,
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

const BarcodesLayout = ({ children }: { children: React.ReactNode }) => {
  const { mutate, isPending } = useBulkPrintBarcode();

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
        <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
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
              <PlusCircle className="w-4 h-4 mr-2" /> Add Product to Print List
            </Button>
          </BarcodePopup>
        </div>
      </div>
      <Navigation />
      <div className="flex flex-col md:flex-row mb-6 justify-end gap-2">
        <Button
          className="justify-between md:w-36 md:order-2"
          variant="outline"
        >
          <span className="inline-flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
        <Popup content={<div className="w-24">Content</div>} variant="popover">
          <Button
            className="justify-between md:w-36 md:order-3"
            variant="outline"
          >
            <span className="inline-flex items-center">
              <ListFilter className="w-4 h-4 mr-2" />
              Sort By
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
