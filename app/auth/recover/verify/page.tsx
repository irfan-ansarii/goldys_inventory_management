"use client";
import React, { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import VerifyOtpForm from "../../components/verify-otp-form";
import ResetPasswordForm from "../../components/reset-password-form";
import { useRouterStuff } from "@/hooks/use-router-stuff";

const VerifyPage = ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { email, step } = searchParams;

  const [response, setResponse] = useState<Record<string, any>>({});
  const { queryParams } = useRouterStuff();

  const callback = (data: any) => {
    setResponse(data);
    queryParams({
      set: { step: "2" },
    });
  };

  if (Number(step) === 2) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>

        <ResetPasswordForm email={email} otp={response?.otp} />

        <div className="space-y-4">
          <div className="flex items-center space-x-2 w-full">
            <hr className="flex-grow" />
            <span className="text-muted-foreground text-sm">OR</span>
            <hr className="flex-grow" />
          </div>
          <Link
            href="/auth/signin"
            className={buttonVariants({ className: "w-full" })}
          >
            Signin
          </Link>
          <div className="flex items-center justify-center w-full">
            <p className="text-sm text-muted-foreground">
              Dont have account yet?
            </p>

            <Link
              href="/auth/recover"
              className={buttonVariants({
                variant: "link",
                className: "!px-2",
              })}
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">One-Time Password</h1>
        <p className="text-muted-foreground">
          Enter OTP sent to{" "}
          <span className="text-foreground ml-1">{email}</span>
        </p>
      </div>

      <VerifyOtpForm email={email} action="reset" callback={callback} />

      <div className="space-y-4">
        <div className="flex items-center space-x-2 w-full">
          <hr className="flex-grow" />
          <span className="text-muted-foreground text-sm">OR</span>
          <hr className="flex-grow" />
        </div>
        <Link
          href="/auth/signin"
          className={buttonVariants({ className: "w-full" })}
        >
          Back to signin
        </Link>

        <div className="flex items-center justify-center w-full">
          <p className="text-sm text-muted-foreground">
            Dont have account yet?
          </p>

          <Link
            href="/auth/recover"
            className={buttonVariants({
              variant: "link",
              className: "!px-2",
            })}
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
