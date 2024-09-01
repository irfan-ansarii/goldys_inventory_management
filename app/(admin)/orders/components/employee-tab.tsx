import React, { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useUsersData } from "@/query/users";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/custom-ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

import PopupLoading from "@/components/popup-loading";

interface Props {
  onPrev: () => void;
  onNext: () => void;
}
const EmployeeTab = ({ onPrev, onNext }: Props) => {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useUsersData({ roles: ["employee"], q: search });
  const form = useFormContext();

  const disabled = !form.watch("employeeId");

  return (
    <div>
      <DialogHeader className="md:mb-3">
        <DialogTitle>Select Employee</DialogTitle>
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
          name="employeeId"
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
                    <FormItem key={user.id} className="overflow-hidden">
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
        <Button type="button" onClick={onNext} disabled={disabled}>
          Next <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default EmployeeTab;
