"use client";

import { z } from "zod";
import React, { useState } from "react";
import { Loader } from "lucide-react";
import Popup from "@/components/custom-ui/popup";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser, useUpdateUser } from "@/query/users";
import { useRouter } from "next/navigation";

const roles = [
  { label: "Customer", value: "customer" },
  { label: "Supplier", value: "supplier" },
  { label: "Employee", value: "employee" },
];

const schema = z.object({
  id: z.any(),
  storeId: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  phone: z.string().length(10, { message: "Invalid phone" }),
  email: z.string().email({ message: "Invalid email" }),
  role: z.enum(["admin", "user", "customer", "supplier", "employee"]),
  address: z
    .object({
      address: z.string().default(""),
      city: z.string().default(""),
      state: z.string().default(""),
      pincode: z.string().default(""),
      gstin: z.string().default(""),
    })
    .superRefine((val, ctx) => {
      const { address } = val;
      const validateKeys = ["city", "state", "pincode"];
      if (!address) return;

      for (const key of validateKeys) {
        // @ts-ignore
        if (!val[key] || val[key] === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Required`,
            path: [key],
          });
        }
      }
    }),
});
type FormValue = z.infer<typeof schema>;

interface Props {
  children: React.ReactNode;
  defaultValue?: FormValue;
  defaultRoles?: typeof roles;
}

const UserPopup: React.FC<Props> = ({
  children,
  defaultValue,
  defaultRoles,
}) => {
  const [open, setOpen] = useState(false);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser(defaultValue?.id);

  const router = useRouter();
  const form = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: defaultValue,
  });

  const onSubmit = (values: FormValue) => {
    const role = roles.find((role) => role.value === values.role);
    const { id, storeId, ...rest } = values;

    if (defaultValue?.id) {
      updateUser.mutate(rest, {
        onSuccess: () => {
          router.refresh();
          setOpen(false);
        },
      });
    } else {
      createUser.mutate(rest, {
        onSuccess: () => {
          router.refresh();
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-2 md:p-6 flex flex-col gap-6"
          >
            <DialogHeader>
              <DialogTitle>
                {defaultValue?.id ? "Update" : "Add"} Contact
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[30rem] overflow-y-scroll space-y-4 -mx-4 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(defaultRoles || roles).map(({ label, value }) => (
                          <SelectItem value={value} key={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createUser.isPending || updateUser.isPending}
            >
              {createUser.isPending || updateUser.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </Form>
      }
    >
      {children}
    </Popup>
  );
};

export default UserPopup;
