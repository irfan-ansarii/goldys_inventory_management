import React from "react";
import { Metadata } from "next";
import { parseISO } from "date-fns";
import { getPurchase } from "@/query/purchase";

import PurchaseOrderForm from "../../components/form";

export const metadata: Metadata = {
  title: "Edit Purchase",
};

const EditOrderPage = async ({
  params,
}: {
  params: Record<string, string>;
}) => {
  const { id } = params;
  const { data } = await getPurchase(id);

  data.lineItems = data.lineItems.map((item) => ({
    ...item,
    lineItemId: item.id,
  }));

  return (
    <PurchaseOrderForm
      defaultValues={{ ...data, createdAt: parseISO(data.createdAt!) }}
    />
  );
};

export default EditOrderPage;
