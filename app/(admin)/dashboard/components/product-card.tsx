import React from "react";
import AnimatedValue from "@/components/animate-value";

import { CardTitle } from "@/components/ui/card";
import { getAdjustmentsOverview } from "@/query/dashboard";

const ProductCard = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { interval = "today" } = searchParams;

  const { data } = await getAdjustmentsOverview(interval);

  return (
    <div className="flex gap-4">
      <CardTitle>
        <span className="text-xs text-muted-foreground mr-1">IN</span>
        <AnimatedValue value={data.in || 0} />
      </CardTitle>
      <CardTitle>
        <span className="text-xs text-muted-foreground mr-1">OUT</span>
        <AnimatedValue value={data.out || 0} />
      </CardTitle>
    </div>
  );
};

export default ProductCard;
