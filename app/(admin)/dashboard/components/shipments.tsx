import React from "react";

import { getExpensesOverview, getShipmentsOverview } from "@/query/dashboard";
import { CHART_COLORS, EXPENSE_CATEGORIES } from "@/lib/utils";
import ExpensesChart from "./charts/expenses";
import EmptyState from "./empty-state";

const Shipments = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { interval = "today" } = searchParams;

  const { data } = await getShipmentsOverview(interval);
  console.log(data);
  //   const chartData = EXPENSE_CATEGORIES.map((exp, i) => {
  //     const item = data.find((d) => d.name === exp);
  //     return {
  //       name: exp,
  //       total: parseFloat(item?.total || "0"),
  //       fill: CHART_COLORS[i % CHART_COLORS.length],
  //     };
  //   });

  return (
    <>
      {/* <ExpensesChart chartData={chartData} /> */}
      {(!data || data.length === 0) && <EmptyState />}
    </>
  );
};

export default Shipments;
