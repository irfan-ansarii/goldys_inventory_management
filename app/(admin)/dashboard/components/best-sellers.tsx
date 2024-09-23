import React from "react";
import { getProductsOverview } from "@/query/dashboard";
import { Progress } from "@/components/ui/progress";
import Avatar from "@/components/custom-ui/avatar";
import EmptyState from "./empty-state";

const BestSellers = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { interval = "today" } = searchParams;
  const { data } = await getProductsOverview(interval);

  const max = data.reduce((acc, curr) => {
    acc += parseFloat(curr.total! || "0");
    return acc;
  }, 0);

  if (!data || data.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="divide-y">
      {data.map((product, i) => (
        <div
          className="grid grid-cols-3 overflow-hidden gap-3 py-2 first:pt-0 last:pb-0"
          key={`${product.id}-${i}`}
        >
          <div className="flex items-center gap-3 overflow-hidden col-span-2">
            <Avatar src={product.image}></Avatar>
            <div className="overflow-hidden flex-1">
              <p className="text-sm leading-tight truncate">{product.name}</p>
            </div>
          </div>
          <Progress
            title={product.total!}
            value={Math.floor((parseFloat(product.total!) / max) * 100)}
          />
        </div>
      ))}
    </div>
  );
};

export default BestSellers;
