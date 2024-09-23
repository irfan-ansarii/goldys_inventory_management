import React from "react";
import { CHART_COLORS } from "@/lib/utils";
import {
  getPurchaseTransactionsOverview,
  getTransactionsOverview,
} from "@/query/dashboard";
import PaymentsChart from "./charts/payments";
import EmptyState from "./empty-state";
const Payments = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  const { interval = "today" } = searchParams;

  const { data: sale } = await getTransactionsOverview(interval);
  const { data: purchase } = await getPurchaseTransactionsOverview(interval);

  const saleData = sale.map((item, i) => ({
    ...item,
    sale: parseFloat(item.total),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const purchaseData = purchase.map((item, i) => ({
    ...item,
    purchase: parseFloat(item.total),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <>
      <PaymentsChart saleData={saleData} purchaseData={purchaseData} />
      {(!sale || sale.length === 0) && (!purchase || purchase.length === 0) && (
        <EmptyState />
      )}
    </>
  );
};

export default Payments;
