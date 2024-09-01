"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useGenerateOTP } from "@/query/auth";

import { Loader } from "lucide-react";
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

export const signinSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Required" })
    .email({ message: "Invalid email" }),
});

const SendOtpForm = ({ redirect }: { redirect: string }) => {
  const mutation = useGenerateOTP();

  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof signinSchema>) => {
    mutation.mutate(values, {
      onSuccess: ({ data }) => {
        window.location.href = `${redirect}?email=${data.email}`;
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="me@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Button
            className="w-full bg-lime-500 hover:bg-lime-600"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              "Send OTP"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SendOtpForm;
