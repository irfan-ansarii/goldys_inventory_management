import React from "react";
import { Metadata } from "next";
import { parseISO } from "date-fns";
import { getOrder } from "@/query/orders";

import OrderForm from "../../components/form";

export const metadata: Metadata = {
  title: "Edit Order",
};

const EditOrderPage = async ({
  params,
}: {
  params: Record<string, string>;
}) => {
  const { id } = params;
  const { data } = await getOrder(id);

  data.lineItems = data.lineItems.map((item) => ({
    ...item,
    discountLine: {
      type: "fixed",
      amount: item.discount,
    },
    lineItemId: item.id,
  }));

  return (
    <OrderForm
      defaultValues={{ ...data, createdAt: parseISO(data.createdAt!) }}
    />
  );
};

export default EditOrderPage;
