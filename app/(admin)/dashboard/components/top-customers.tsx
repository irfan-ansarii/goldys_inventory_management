import React from "react";
import Link from "next/link";
import { getCustomersOverview, getOverview } from "@/query/dashboard";
import { formatNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Avatar from "@/components/custom-ui/avatar";
import EmptyState from "./empty-state";

const TopCustomers = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { interval = "today" } = searchParams;
  const { data: totals } = await getOverview(interval);
  const { data } = await getCustomersOverview(interval);

  const max = Math.max(...totals.map((t) => parseFloat(t.sale!)));

  if (!data || data.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="divide-y">
      {data.map((user) => (
        <div
          className="grid grid-cols-3 overflow-hidden gap-3 py-2 first:pt-0 last:pb-0"
          key={user.id}
        >
          <div className="flex items-start gap-3 overflow-hidden col-span-2">
            <Avatar src={user.name}></Avatar>
            <div className="overflow-hidden flex-1 truncate">
              <Link
                href={`/orders?q=${user.name}`}
                className="text-sm truncate block"
              >
                {user.name}
              </Link>
              <div className="flex truncate items-center">
                <span className="text-xs text-muted-foreground ">
                  {user.phone}
                </span>
                {" - "}
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
          <Progress
            title={formatNumber(user.total!)}
            value={Math.floor((parseFloat(user.total!) / max) * 100)}
          />
        </div>
      ))}
    </div>
  );
};

export default TopCustomers;
