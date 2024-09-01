import React from "react";
import { Metadata } from "next";
import PurchaseCard from "../components/purchase-card";
import Pagination from "@/components/pagination";

import { getpurchases } from "@/query/purchase";
import NoDataFallback from "@/components/nodata-fallback";

export const metadata: Metadata = {
  title: "Purchases",
};
const PurchasePage = async ({
  searchParams,
}: {
  searchParams: Record<string, any>;
}) => {
  const { data, meta } = await getpurchases({ ...searchParams });

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data?.map((purchase) => (
          // @ts-expect-error
          <PurchaseCard purchase={purchase} key={purchase.id} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default PurchasePage;
