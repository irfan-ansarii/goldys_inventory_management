import React from "react";
import { format } from "date-fns";
import { getOverview } from "@/query/dashboard";
import OverviewChart from "./charts/overview";
import EmptyState from "./empty-state";

const formatDate = (interval: string, value: string) => {
  if (interval === "today" || interval === "yesterday") {
    return format(value, "hh:mm a");
  }
  if (interval === "12month") {
    return format(value, "MMMM");
  }
  return format(value, "dd MMM");
};

const SaleOverview = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { interval = "today" } = searchParams;

  const { data } = await getOverview(interval);

  const chartData = data.map((item) => ({
    ...item,
    name: formatDate(interval, item.name),
  }));

  return (
    <>
      <OverviewChart chartData={chartData} />
      {(!data || data.length === 0) && <EmptyState />}
    </>
  );
};

export default SaleOverview;
