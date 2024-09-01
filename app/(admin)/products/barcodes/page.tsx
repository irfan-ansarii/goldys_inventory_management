import React from "react";
import { Metadata } from "next";
import { getBarcodes } from "@/query/barcodes";
import Pagination from "@/components/pagination";
import BarcodeCard from "../components/barcode-card";
import NoDataFallback from "@/components/nodata-fallback";

export const metadata: Metadata = {
  title: "Barcodes",
};
const BarcodesPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { data, meta } = await getBarcodes({ searchParams });

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data?.map((bar) => (
          <BarcodeCard key={bar.id} data={bar} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default BarcodesPage;
