import React from "react";
import Link from "next/link";
import { Metadata } from "next";

import SendOtpForm from "../components/send-otp-form";
import { buttonVariants } from "@/components/ui/button";
export const metadata: Metadata = {
  title: "Recover",
};
const RecoverPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Recover Password</h1>
        <p className="text-muted-foreground">
          Enter your email to receive a verification code.
        </p>
      </div>

      <SendOtpForm redirect="/auth/recover/verify" />
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
      </div>
    </div>
  );
};

export default RecoverPage;
