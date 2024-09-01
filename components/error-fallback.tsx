"use client";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import React from "react";

interface ErrorType {
  status: number;
  message: string;
  description?: string;
}
const ErrorFallback = ({
  error,
  className,
}: {
  className?: string;
  error?: ErrorType;
}) => {
  const { message, description } = error || {};
  return (
    <div
      className={cn(
        "flex flex-col h-full items-center justify-center",
        className
      )}
    >
      <div className="flex gap-4 items-center flex-col text-base">
        <span className="w-12 h-12 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-full inline-flex justify-center items-center">
          <TriangleAlert className="w-5 h-5" />
        </span>
        <p className="font-semibold">
          {error ? `${message}` : "Something Went Wrong"}
        </p>
        <p className="text-muted-foreground text-sm">
          {description ? description : "An unexpected error has occurred"}
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;
