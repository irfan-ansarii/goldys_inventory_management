import React from "react";
import { Metadata } from "next";
import SigninForm from "../components/signin-form";

export const metadata: Metadata = {
  title: "Signin",
};

const SigninPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your email and password to access your account.
        </p>
      </div>

      <SigninForm />
    </div>
  );
};

export default SigninPage;
