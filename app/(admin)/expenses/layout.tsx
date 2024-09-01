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
  "All",
  "Maintenance",
  "Marketing",
  "Packaging",
  "Salaries",
  "Shipping",
  "Utilities",
  "Other",
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
            <Button className="min-w-32">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </UserPopup>
        </div>
      </div>
      <div className="flex flex-col md:flex-row mb-6 justify-end gap-2">
        <Popup
          content={
            <div className="md:w-40 space-y-1 [&>*]:justify-start [&>*]:w-full">
              {categories.map((category) => {
                const isActive =
                  searchParamsObj.cat === category.toLowerCase() ||
                  (!searchParamsObj.cat && category === "All");

                const path = category === "All" ? "" : category.toLowerCase();

                return (
                  <Link
                    key={category}
                    href={
                      queryParams({
                        set: {
                          cat: path,
                        },
                        getNewPath: true,
                      }) as string
                    }
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      className: isActive
                        ? "!bg-accent [&>svg]:opacity-100"
                        : "",
                    })}
                  >
                    {category}
                    <Check
                      className={`w-4 h-4 ml-auto ${
                        isActive ? "opacity-100" : "opacity-0"
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
            className="justify-between md:w-44 md:order-3"
            variant="outline"
          >
            <span className="inline-flex items-center">
              <ListFilter className="w-4 h-4 mr-2" />
              {capitalizeText(searchParamsObj.cat || "Category")}
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
