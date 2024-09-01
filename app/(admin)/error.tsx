"use client";
import ErrorFabblack from "@/components/error-fallback";
import React from "react";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return <ErrorFabblack />;
};

export default ErrorPage;
