import React, { useState } from "react";

import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useFormContext } from "react-hook-form";
import { UserType, useUsersData } from "@/query/users";

import Avatar from "@/components/custom-ui/avatar";
import PopupLoading from "@/components/popup-loading";

interface Props {
  onNext: () => void;
}

const SupplierTab = ({ onNext }: Props) => {
  const form = useFormContext();

  const disabled = !form.watch("supplierId");

  const [search, setSearch] = useState("");
  const { data, isLoading } = useUsersData({ roles: ["supplier"], q: search });

  const handleSupplier = (selected: UserType) => {
    const { name, phone, email, address: add } = selected;
    let billing = [name, phone, email];

    if (add?.address) {
      const { address, city, state, pincode, gstin } = add as Record<
        string,
        string
      >;

      billing = [name, address, city, `${state} ${pincode}`, phone, email];
      if (gstin) billing.push(`GSTIN: ${gstin}`);
    }

    form.setValue("source", billing);
  };

  return (
    <div>
      <DialogHeader className="md:mb-3">
        <DialogTitle>Select Supplier</DialogTitle>
      </DialogHeader>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 px-3 inline-flex items-center justify-center">
          <Search className="w-4 h-4" />
        </span>
        <Input
          placeholder="Search..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="h-full overflow-y-scroll">
        {isLoading ? (
          <div className="space-y-2">
            <PopupLoading />
          </div>
        ) : null}
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={(e) => {
                    field.onChange(e);
                    onNext();
                  }}
                  defaultValue={field.value}
                  className="gap-2"
                >
                  {data?.data?.map((user) => (
                    <FormItem
                      key={user.id}
                      className="overflow-hidden"
                      onClick={() => handleSupplier(user)}
                    >
                      <FormLabel className="flex relative cursor-pointer justify-between p-2 border rounded-md items-center">
                        <div className="flex items-center gap-2 truncate">
                          <Avatar src={user.name} />
                          <div className="space-y-1.5 truncate leading-tight">
                            <p>{user.name}</p>
                            <div className="flex gap-2 font-normal text-muted-foreground truncate">
                              <p className="truncate">{user.phone}</p>
                              <p>▪</p>
                              <p className="truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <FormControl className="absolute right-2">
                          {/* @ts-ignore */}
                          <RadioGroupItem value={user.id} />
                        </FormControl>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex [&>*]:flex-1 gap-2">
        <Button type="button" disabled={disabled} onClick={onNext}>
          Next
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default SupplierTab;
