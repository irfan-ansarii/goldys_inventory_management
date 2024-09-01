import React from "react";
import Link from "next/link";
import SendOtpForm from "../../components/send-otp-form";
import { buttonVariants } from "@/components/ui/button";

const OtpSigninPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Signin with OTP</h1>
        <p className="text-muted-foreground">
          Enter your email and we will send you an OTP.
        </p>
      </div>

      <SendOtpForm redirect="/auth/signin/verify" />
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

export default OtpSigninPage;
