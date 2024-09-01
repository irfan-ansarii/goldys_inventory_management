import React from "react";
import { getOption } from "@/query/options";

import PaymentForm from "./payment-form";

const PaymentModes = async () => {
  const { data: order } = await getOption("order-payments");
  const { data: purchase } = await getOption("purchase-payments");
  return <PaymentForm order={order} purchase={purchase} />;
};

export default PaymentModes;
