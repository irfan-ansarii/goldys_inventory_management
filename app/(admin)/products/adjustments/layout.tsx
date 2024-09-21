"use client";
import React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, ListFilter } from "lucide-react";

import Navigation from "../components/navigation";
import Popup from "@/components/custom-ui/popup";
import SearchBar from "@/components/search-bar";
import CreateAdjustments from "../components/create-adjustments";
import { useRouterStuff } from "@/hooks/use-router-stuff";
import Link from "next/link";

const types = [
  { label: "All", value: "" },
  { label: "In", value: "in" },
  { label: "Out", value: "out" },
];

const AdjustmentsLayout = ({ children }: { children: React.ReactNode }) => {
  const { queryParams, searchParamsObj } = useRouterStuff();
  return (
    <>
      <div className="flex flex-col sm:flex-row md:col-span-3 mb-6">
        <div className="space-y-1">
          <CardTitle>Adjustments</CardTitle>
          <CardDescription className="leading-non">
            View adjustment history
          </CardDescription>
        </div>
        <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <CreateAdjustments />
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
                        ? { del: "type" }
                        : { set: { type: type.value } }),
                      getNewPath: true,
                    }) as string
                  }
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: `${
                      (searchParamsObj.type || "") === type.value
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
                types.find((t) => t.value === (searchParamsObj.type || ""))
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

export default AdjustmentsLayout;
