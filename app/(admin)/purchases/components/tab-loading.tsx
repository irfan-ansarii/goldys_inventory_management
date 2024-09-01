import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
const TabLoading = ({ count }: { count?: number }) => {
  return (
    <div className="space-y-2">
      {[...Array(count || 4)].map((_, i) => (
        <div className="flex gap-2 items-center p-2 border rounded-md" key={i}>
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-2/3 h-2.5" />
          </div>
          <Skeleton className="w-10 h-3 ml-auto" />
        </div>
      ))}
    </div>
  );
};

export default TabLoading;
