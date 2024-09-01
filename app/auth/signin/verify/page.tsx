import React from "react";
import VerifyOtpForm from "../../components/verify-otp-form";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const VerifyPage = ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { email } = searchParams;
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">One-Time Password</h1>
        <p className="text-muted-foreground">
          Enter OTP sent to{" "}
          <span className="text-foreground ml-1">{email}</span>
        </p>
      </div>

      <VerifyOtpForm email={email} action="signin" />

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
          Signin with Password
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
