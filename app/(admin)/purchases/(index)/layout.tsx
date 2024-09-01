import React from "react";
import Link from "next/link";
import Popup from "@/components/custom-ui/popup";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronDown, Filter, ListFilter, PlusCircle } from "lucide-react";

import SearchBar from "@/components/search-bar";

const OrdersLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="mb-6 flex">
        <div className="space-y-1">
          <CardTitle>Purchases</CardTitle>
          <CardDescription>View and manage your orders.</CardDescription>
        </div>
        <Link
          href="/purchases/new"
          className={buttonVariants({ className: "ml-auto min-w-32" })}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add Purchase
        </Link>
      </div>
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

export default OrdersLayout;
