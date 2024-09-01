import React from "react";
import { Metadata } from "next";
import { getAdjustments } from "@/query/adjustments";
import Pagination from "@/components/pagination";
import AdjustmentCard from "../components/adjustment-card";
import NoDataFallback from "@/components/nodata-fallback";

export const metadata: Metadata = {
  title: "Adjustments",
};
const AdjustmentPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { data, meta } = await getAdjustments(searchParams);

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data?.map((adj) => (
          <AdjustmentCard key={adj.id} data={adj} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default AdjustmentPage;
