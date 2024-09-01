import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";

const SkeletonLoading = ({ count }: { count?: number }) => {
  return (
    <>
      {[...Array(count || 4)].map((_, i) => (
        <Card className="rounded-md p-4 md:p-6" key={i}>
          <div className="flex gap-2 md:gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="w-28 h-3 rounded-full" />
              <Skeleton className="w-4/6 md:w-1/6 h-3 rounded-full" />
              <Skeleton className="w-5/6 md:w-2/6 h-3 rounded-full" />
            </div>
            <Skeleton className="w-20 md:w-24 self-center h-4 rounded-full ml-auto" />
          </div>
        </Card>
      ))}
    </>
  );
};

export default SkeletonLoading;
