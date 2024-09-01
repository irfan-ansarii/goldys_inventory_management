import React from "react";
import AnimatedValue from "@/components/animate-value";
import { getExpensesOverview } from "@/query/dashboard";

const ExpenseCard = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { interval = "today" } = searchParams;

  const { data } = await getExpensesOverview(interval);

  const totalExpense = data.reduce(
    (acc, curr) => (acc += parseFloat(curr.total || "0")),
    0
  );

  return <AnimatedValue value={totalExpense} formatAsNumber />;
};

export default ExpenseCard;
