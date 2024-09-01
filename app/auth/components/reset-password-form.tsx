"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Eye, EyeOff, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Tooltip from "@/components/custom-ui/tooltip";
import { useResetPassword } from "@/query/auth";

export const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, { message: "Incorrect OTP" }),
  password: z.string().min(8, { message: "Required" }),
  confirmPassword: z.string().min(8, { message: "Required" }),
});

const ResetPasswordForm = ({ email, otp }: { email: string; otp: any }) => {
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending, isSuccess } = useResetPassword();
  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email,
      otp,
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.getValues("password")?.length > 0;

  const onSubmit = (values: z.infer<typeof resetSchema>) => {
    mutate(values, {
      onSuccess: (res) => (window.location.href = "/auth/signin"),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>New Password</FormLabel>

              <FormControl>
                <Input
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  {...field}
                />
              </FormControl>

              <Tooltip
                content={showPassword ? "Hide password" : "Show password"}
              >
                <Button
                  size="icon"
                  variant="link"
                  type="button"
                  className="absolute right-0 bottom-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </Tooltip>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          disabled={!password}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <Button
            className="w-full bg-lime-500 hover:bg-lime-600"
            type="submit"
            disabled={isPending || isSuccess}
          >
            {isPending || isSuccess ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              "Create Password"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
