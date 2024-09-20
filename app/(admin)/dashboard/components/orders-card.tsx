import React from "react";
import AnimatedValue from "@/components/animate-value";
import { getOverview } from "@/query/dashboard";

const OrdersCard = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { interval = "today" } = searchParams;

  const { data } = await getOverview(interval);

  const totalIncome = data.reduce(
    (acc, curr) => (acc += parseFloat(curr.sale)),
    0
  );

  return <AnimatedValue value={totalIncome} formatAsNumber />;
};

export default OrdersCard;
