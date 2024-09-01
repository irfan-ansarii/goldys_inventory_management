"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSigninOTP, useRecoverPassword, useGenerateOTP } from "@/query/auth";
import { setCookie } from "cookies-next";

import { Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, { message: "Incorrect OTP" }),
});

const VerifyOtpForm = ({
  email,
  action,
  callback,
}: {
  email: string;
  action: "signin" | "reset";
  callback?: (p: any) => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(60);

  const recover = useRecoverPassword();
  const otp = useGenerateOTP();
  const signin = useSigninOTP();

  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email,
      otp: "",
    },
  });

  // verify otp
  const onSubmit = async (values: z.infer<typeof verifySchema>) => {
    if (action === "signin") {
      // signin
      signin.mutate(values, {
        onSuccess: ({ data }) => {
          setCookie("token", data.token);
          window.location.href = "/dashboard";
        },
      });
    } else {
      recover.mutate(values, {
        onSuccess: ({ data }) => {
          const values = form.getValues();
          callback?.(values);
        },
      });
    }
  };

  // resend otp
  const handleResendOtp = async () => {
    const email = form.getValues("email");

    otp.mutate(
      { email },
      {
        onSuccess: () => {
          setTimeLeft(60);
        },
      }
    );
  };
  const isLoading =
    signin.isPending ||
    recover.isPending ||
    signin.isSuccess ||
    recover.isSuccess;

  // timeleft event listener
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>

              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup className="[&>div]:flex-1  [&>div]:h-12 w-full">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>

              <FormMessage />
              <div className="flex justify-between text-sm">
                <p className="text-sm text-muted-foreground">
                  {otp.isPending ? "Sending..." : "Did not received OTP?"}
                </p>

                {otp.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : timeLeft > 0 ? (
                  <span className="text-sm font-medium">
                    Resend OTP in {timeLeft} seconds
                  </span>
                ) : (
                  <Button
                    className="underline py-0 px-0 h-auto"
                    variant="link"
                    type="button"
                    onClick={handleResendOtp}
                  >
                    Resend OTP
                  </Button>
                )}
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Button
            className="w-full bg-lime-500 hover:bg-lime-600"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Verify"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VerifyOtpForm;
