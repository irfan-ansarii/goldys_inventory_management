import React from "react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronDown, Filter, ListFilter } from "lucide-react";

import Navigation from "../components/navigation";
import Popup from "@/components/custom-ui/popup";
import SearchBar from "@/components/search-bar";
import CreateTransfer from "../components/create-transfer";

const TransfersLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row md:col-span-3 mb-6">
        <div className="space-y-1">
          <CardTitle>Transfers</CardTitle>
          <CardDescription className="leading-non">
            View transfer history
          </CardDescription>
        </div>
        <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <CreateTransfer />
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

export default TransfersLayout;
