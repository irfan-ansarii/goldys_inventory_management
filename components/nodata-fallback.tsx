import React from "react";
import { cn } from "@/lib/utils";
import { FileSearch } from "lucide-react";

const NoDataFallback = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full items-center justify-center",
        className
      )}
    >
      <div className="flex gap-2 items-center flex-col text-base">
        <span className="w-12 shadow h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full inline-flex justify-center items-center">
          <FileSearch className="w-5 h-5" />
        </span>
        <p className="font-semibold">No Data Available</p>
        <p className="text-muted-foreground text-sm">
          No data is available. Please try removing or adjusting the filter.
        </p>
      </div>
    </div>
  );
};

export default NoDataFallback;
