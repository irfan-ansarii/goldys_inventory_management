"use client";
import React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, ListFilter, PlusCircle } from "lucide-react";

import Popup from "@/components/custom-ui/popup";
import SearchBar from "@/components/search-bar";
import UserPopup from "./components/expense-popup";
import { useRouterStuff } from "@/hooks/use-router-stuff";
import { capitalizeText } from "@/lib/utils";

const categories = [
  { label: "All", value: "" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Marketing", value: "marketing" },
  { label: "Packaging", value: "packaging" },
  { label: "Salaries", value: "salaries" },
  { label: "Shipping", value: "shipping" },
  { label: "Utilities", value: "utilities" },
  { label: "Other", value: "other" },
];

const ExpenseLayout = ({ children }: { children: React.ReactNode }) => {
  const { queryParams, searchParamsObj } = useRouterStuff();

  return (
    <>
      <div className="flex flex-col sm:flex-row md:col-span-3 mb-6">
        <div className="space-y-1">
          <CardTitle>Expenses</CardTitle>
          <CardDescription className="leading-non">
            View and manage store expenses
          </CardDescription>
        </div>
        <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <UserPopup
            defaultValue={{
              title: "",
              category: "",
              amount: "",
              createdAt: new Date().toISOString(),
              notes: "",
            }}
          >
            <Button className="min-w-48">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </UserPopup>
        </div>
      </div>
      <div className="flex flex-col md:flex-row mb-6 justify-end gap-2">
        <Popup
          content={
            <div className="md:w-44 space-y-1 [&>*]:justify-start [&>*]:w-full">
              {categories.map((category) => {
                return (
                  <Link
                    key={category.value}
                    href={
                      queryParams({
                        set: {
                          cat: category.value,
                        },
                        getNewPath: true,
                      }) as string
                    }
                    className={buttonVariants({
                      variant:
                        (searchParamsObj.cat || "") === category.value
                          ? "secondary"
                          : "ghost",
                      size: "sm",
                    })}
                  >
                    {category.label}
                    <Check
                      className={`w-4 h-4 ml-auto ${
                        (searchParamsObj.cat || "") === category.value
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                  </Link>
                );
              })}
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
                categories.find((i) => i.value === (searchParamsObj.cat || ""))
                  ?.label
              }
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </Popup>

        <SearchBar containerClassName="flex-1 md:order-1 w-[18rem]" />
      </div>
      {children}
    </>
  );
};

export default ExpenseLayout;
