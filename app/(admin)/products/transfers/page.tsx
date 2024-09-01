import React from "react";
import Pagination from "@/components/pagination";
import { getTransfers } from "@/query/transfers";
import TransferCard from "../components/transfer-card";
import NoDataFallback from "@/components/nodata-fallback";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transfers",
};
const TransfersPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { data, meta } = await getTransfers(searchParams);

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data?.map((transfer) => (
          <TransferCard key={transfer.id} data={transfer} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default TransfersPage;
