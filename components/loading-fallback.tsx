import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import React from "react";

const LoadingFallback = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full items-center justify-center",
        className
      )}
    >
      <div className="flex gap-2 items-center flex-col text-base">
        <span className="w-12 h-12 shadow bg-background dark:bg-accent rounded-full inline-flex justify-center items-center">
          <Loader className="w-4 h-4 animate-spin" />
        </span>
        <p className="font-semibold">Please wait...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
