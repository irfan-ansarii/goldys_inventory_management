"use client";
import React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, ListFilter, PlusCircle } from "lucide-react";

import Popup from "@/components/custom-ui/popup";
import SearchBar from "@/components/search-bar";
import UserPopup from "../components/user-popup";
import Link from "next/link";
import { useRouterStuff } from "@/hooks/use-router-stuff";

const roles = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Customer",
    value: "customer",
  },
  {
    label: "Supplier",
    value: "supplier",
  },
  {
    label: "Employee",
    value: "employee",
  },
];
const ContactsLayout = ({ children }: { children: React.ReactNode }) => {
  const { queryParams, searchParamsObj } = useRouterStuff();
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
        <Popup
          content={
            <div className="md:w-44 flex flex-col [&>*]:justify-start">
              {roles.map((path) => (
                <Link
                  key={path.value}
                  href={
                    queryParams({
                      set: { roles: path.value },
                      getNewPath: true,
                    }) as string
                  }
                  className={buttonVariants({
                    variant:
                      (searchParamsObj.roles || "") === path.value
                        ? "secondary"
                        : "ghost",
                    size: "sm",
                  })}
                >
                  {path.label}
                  <Check
                    className={`w-4 h-4 text-muted-foreground ml-auto ${
                      (searchParamsObj.roles || "") === path.value
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
          <Button
            className="justify-between md:w-48 md:order-3"
            variant="outline"
          >
            <span className="inline-flex items-center">
              <ListFilter className="w-4 h-4 mr-2" />
              {
                roles.find((i) => i.value === (searchParamsObj.roles || ""))
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

export default ContactsLayout;
