"use client";
import React, { useState } from "react";
import z from "zod";
import { StoreType, useCreateStore, useUpdateStore } from "@/query/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import Popup from "@/components/custom-ui/popup";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import Avatar from "@/components/custom-ui/avatar";
import { useCreateUpload } from "@/query/uploads";

const schema = z
  .object({
    id: z.any(),
    name: z.string().min(1, { message: "Required" }),
    company: z.string().min(1, { message: "Required" }),
    logo: z.string().min(1, { message: "Required" }),
    phone: z.string().length(10, { message: "Invalid phone" }),
    email: z.string().email({ message: "Invalid email" }),
    address: z.object({
      address: z.string().min(1, { message: "Reduired" }).default(""),
      city: z.string().min(1, { message: "Reduired" }).default(""),
      state: z.string().min(1, { message: "Reduired" }).default(""),
      pincode: z.string().min(1, { message: "Reduired" }).default(""),
    }),
    gstin: z
      .string({ message: "Required" })
      .min(1, { message: "Reduired" })
      .default(""),
    domain: z.literal("").or(
      z.string().regex(/\bmyshopify\.com\b/, {
        message: "Invalid store url",
      })
    ),
    token: z.string().default(""),
  })
  .superRefine(({ domain, token }, ctx) => {
    if (domain.length > 0 && token.length < 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid access token",
        path: ["token"],
      });
    }
  });

type FormValue = z.infer<typeof schema>;

interface DefaultValuesType extends Omit<StoreType, "address"> {
  address: { [k: string]: string };
}

interface Props {
  children: React.ReactNode;
  defaultValues?: DefaultValuesType;
}

const StoresPopup = ({ children, defaultValues }: Props) => {
  const [open, setOpen] = useState(false);
  const create = useCreateStore();
  const update = useUpdateStore(defaultValues?.id);
  const upload = useCreateUpload();
  const router = useRouter();
  const form = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues:
      {
        ...defaultValues,
        gstin: defaultValues?.gstin!,
        domain: defaultValues?.domain!,
        token: defaultValues?.token!,
      } || {},
  });
  const logo = form.watch("logo");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      const tempImage = URL.createObjectURL(files[0]);
      form.setValue("logo", tempImage);

      upload.mutate(files[0], {
        onSuccess: ({ data }) => form.setValue("logo", data.url),
        onError: () => form.setValue("logo", ""),
      });
    }
  };

  const onSubmit = (values: FormValue) => {
    if (defaultValues?.id) {
      update.mutate(values, {
        onSuccess: () => {
          router.refresh();
          setOpen(false);
        },
      });
    } else {
      create.mutate(values, {
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
                {defaultValues?.id ? "Update" : "Add"} Store
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[30rem] overflow-y-scroll space-y-6 -mx-4 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid items-center gap-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="relative">
                  <Input id="logo" onChange={handleUpload} type="file" />
                  {logo && (
                    <Avatar
                      className="absolute top-0 right-0 rounded-md"
                      src={logo}
                    />
                  )}
                  {!logo && (
                    <p className="text-sm text-destructive">Required</p>
                  )}
                </div>
                <FormMessage />
              </div>
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
                  name="gstin"
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
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Token</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                create.isPending || update.isPending || upload.isPending
              }
            >
              {create.isPending || update.isPending ? (
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

export default StoresPopup;
