"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import Popup from "@/components/custom-ui/popup";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, ListFilter, PlusCircle } from "lucide-react";

import SearchBar from "@/components/search-bar";
import Navigation from "../components/navigation";
import { useRouterStuff } from "@/hooks/use-router-stuff";
import { capitalizeText } from "@/lib/utils";

const ProductsLayout = ({ children }: { children: React.ReactNode }) => {
  const { searchParamsObj, queryParams } = useRouterStuff();

  const statusFilter = useMemo(() => {
    return searchParamsObj.status;
  }, [searchParamsObj]);

  return (
    <>
      <div className="flex flex-col sm:flex-row md:col-span-3 mb-6">
        <div className="space-y-1">
          <CardTitle>Products</CardTitle>
          <CardDescription className="leading-non">
            Add product and start selling
          </CardDescription>
        </div>
        <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <Link
            href="/products/new"
            className={buttonVariants({ className: "min-w-32" })}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </div>
      </div>
      <Navigation />
      <div className="flex flex-col md:flex-row mb-6 justify-end gap-2">
        <Popup
          content={
            <div className="md:w-40 space-y-1 [&>*]:justify-start [&>*]:w-full">
              <Link
                href={
                  queryParams({
                    del: "status",
                    getNewPath: true,
                  }) as string
                }
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: `${
                    !statusFilter ? "!bg-accent [&>svg]:opacity-100" : ""
                  }`,
                })}
              >
                All
                <Check className="w-4 h-4 ml-auto opacity-0" />
              </Link>
              <Link
                href={
                  queryParams({
                    set: { status: "active" },
                    getNewPath: true,
                  }) as string
                }
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: `${
                    statusFilter === "active"
                      ? "!bg-accent [&>svg]:opacity-100"
                      : ""
                  }`,
                })}
              >
                Active
                <Check className="w-4 h-4 ml-auto opacity-0" />
              </Link>
              <Link
                href={
                  queryParams({
                    set: { status: "archived" },
                    getNewPath: true,
                  }) as string
                }
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: `${
                    statusFilter === "archived"
                      ? "!bg-accent [&>svg]:opacity-100"
                      : ""
                  }`,
                })}
              >
                Archived
                <Check className="w-4 h-4 ml-auto opacity-0" />
              </Link>
            </div>
          }
          variant="popover"
        >
          <Button
            className="justify-between md:w-44 md:order-3"
            variant="outline"
          >
            <span className="inline-flex items-center">
              <ListFilter className="w-4 h-4 mr-2" />
              {capitalizeText(statusFilter || "All")}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </Popup>
        <SearchBar containerClassName="flex-1 md:order-1 md:w-[400px]" />
      </div>
      {children}
    </>
  );
};

export default ProductsLayout;
