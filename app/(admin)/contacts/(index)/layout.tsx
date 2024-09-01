import React from "react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronDown, Filter, ListFilter, PlusCircle } from "lucide-react";

import Popup from "@/components/custom-ui/popup";
import SearchBar from "@/components/search-bar";
import UserPopup from "../components/user-popup";

const ContactsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row md:col-span-3 mb-6">
        <div className="space-y-1">
          <CardTitle>Contacts</CardTitle>
          <CardDescription className="leading-non">
            View and manage customers and suppliers
          </CardDescription>
        </div>
        <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <UserPopup
            defaultValue={{
              name: "",
              phone: "",
              email: "",
              role: "customer",
              address: {
                address: "",
                city: "",
                state: "",
                pincode: "",
                gstin: "",
              },
            }}
          >
            <Button className="min-w-32">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Contact
            </Button>
          </UserPopup>
        </div>
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

export default ContactsLayout;
