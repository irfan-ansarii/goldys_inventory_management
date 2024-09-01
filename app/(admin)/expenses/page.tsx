import React from "react";
import { Metadata } from "next";
import Pagination from "@/components/pagination";
import ExpenseCard from "./components/expense-card";

import NoDataFallback from "@/components/nodata-fallback";

import { getExpenses } from "@/query/expenses";

export const metadata: Metadata = {
  title: "Expenses",
};
const ExpensePage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { data, meta } = await getExpenses(searchParams);

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data.map((exp) => (
          <ExpenseCard expense={exp} key={exp.id} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default ExpensePage;
