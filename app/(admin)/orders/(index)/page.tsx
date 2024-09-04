import React from "react";
import { Metadata } from "next";
import { getOrders } from "@/query/orders";
import OrderCard from "../components/order-card";
import Pagination from "@/components/pagination";
import NoDataFallback from "@/components/nodata-fallback";

export const metadata: Metadata = {
  title: "Orders",
};
const OrdersPage = async ({
  searchParams,
}: {
  searchParams: Record<string, any>;
}) => {
  const { data, meta } = await getOrders({ ...searchParams });

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data?.map((order) => (
          // @ts-ignore
          <OrderCard order={order} key={order.id} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default OrdersPage;
