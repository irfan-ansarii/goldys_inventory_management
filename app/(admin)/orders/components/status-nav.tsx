"use client";
import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useRouterStuff } from "@/hooks/use-router-stuff";

const paths = [
  { label: "All", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Overpaid", value: "overpaid" },
  { label: "Partially Paid", value: "partially paid" },
  { label: "Refunded", value: "refunded" },
];

const StatusNav = () => {
  const { queryParams, searchParamsObj } = useRouterStuff();
  return (
    <div className="overflow-hidden">
      <div className="flex rounded-md bg-secondary gap-1 p-1 mb-6 flex-nowrap overflow-x-auto">
        {paths.map((path) => (
          <Link
            key={path.value}
            href={
              queryParams({
                set: { status: path.value },
                getNewPath: true,
              }) as string
            }
            className={buttonVariants({
              variant:
                (searchParamsObj.status || "") === path.value
                  ? "outline"
                  : "ghost",
              size: "sm",
              className:
                "border-none !whitespace-normal flex-[0_0_7rem] flex-nowrap",
            })}
          >
            {path.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StatusNav;
