import React from "react";
import AnimatedValue from "@/components/animate-value";
import { getTransactionsOverview } from "@/query/dashboard";

const IncomeCard = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { interval = "today" } = searchParams;

  const { data: incomes } = await getTransactionsOverview(interval);

  const totalIncome = incomes.reduce(
    (acc, curr) => (acc += parseFloat(curr.total)),
    0
  );

  return <AnimatedValue value={totalIncome} formatAsNumber />;
};

export default IncomeCard;
