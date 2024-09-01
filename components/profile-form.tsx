"use client";
import React, { useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionType, useUpdateUser } from "@/query/users";
import { capitalizeText } from "@/lib/utils";

import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

import { Check, ChevronDown, Loader, LogOut } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Popup from "@/components/custom-ui/popup";

import Tooltip from "@/components/custom-ui/tooltip";
import Avatar from "@/components/custom-ui/avatar";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().length(10, { message: "Invalid phone" }),
  email: z.string().email(),
  role: z.string().optional(),
  store: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
const themes = ["light", "dark", "system"];

const ProfileForm = ({ defaultValues }: { defaultValues: SessionType }) => {
  const { name, phone, email, role, store } = defaultValues;
  const [themeOpen, setThemeOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const { mutate, isPending } = useUpdateUser(defaultValues.id);
  const { logout } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
      phone: phone!,
      email: email!,
      role: capitalizeText(role),
      store: capitalizeText(store?.name!),
    },
  });

  // handle theme change
  const handleTheme = (mode: string) => {
    setTheme(mode);
    setThemeOpen(false);
  };

  // handle update profile
  const onSubmit = (values: any) => {
    mutate(values, {
      onSuccess: () => {
        router.refresh();
        setOpen(false);
      },
      onError: (e) => console.log(e),
    });
  };

  // handle logout
  const handleLogout = () => {
    logout();
    window.location.href = "/auth/signin";
  };
  return (
    <div className="flex overflow-hidden pr-1 gap-1 h-12 bg-accent justify-between items-center rounded-md">
      <Popup
        open={open}
        onOpenChange={setOpen}
        content={
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 md:py-6"
            >
              <div className="px-6">
                <DialogHeader>
                  <DialogTitle>My Account</DialogTitle>
                </DialogHeader>
              </div>
              <div className="h-[25.5rem] overflow-y-scroll space-y-6 !px-6">
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
                <div className="grid grid-cols-2 gap-6">
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
                  disabled
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="store"
                  disabled
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="px-6 space-y-6">
                <div className="space-y-2">
                  <FormLabel>Theme</FormLabel>
                  <Popup
                    open={themeOpen}
                    onOpenChange={setThemeOpen}
                    variant="popover"
                    content={
                      <div className="flex flex-col w-40 [&>*]:justify-start">
                        {themes.map((th) => (
                          <Button
                            key={th}
                            variant="ghost"
                            className="capitalize"
                            onClick={() => handleTheme(th)}
                            size="sm"
                          >
                            {th}

                            <Check
                              className={`w-4 h-4 ml-auto ${
                                theme === th ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </Button>
                        ))}
                      </div>
                    }
                  >
                    <Button
                      variant="outline"
                      className="capitalize gap-2 w-full justify-between"
                    >
                      {theme} <ChevronDown className="w-4 h-4" />
                    </Button>
                  </Popup>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending || !form.formState.isDirty}
                >
                  {isPending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        }
      >
        <Button
          className="!bg-accent !px-2 gap-1 !h-12 truncate flex-1 justify-start"
          variant="ghost"
        >
          <Avatar
            src={`https://api.dicebear.com/5.x/initials/svg?backgroundType=gradientLinear&fontSize=40&seed=${defaultValues.name}`}
            className="w-8 h-8"
          ></Avatar>

          <span className="truncate">{defaultValues.name}</span>
        </Button>
      </Popup>
      <Tooltip content="Logout">
        <Button
          className="flex-none w-9 h-9 p-0"
          variant="destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default ProfileForm;
