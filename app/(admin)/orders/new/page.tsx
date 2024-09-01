import React from "react";
import { Metadata } from "next";
import OrderForm from "../components/form";

export const metadata: Metadata = {
  title: "New Order",
};

const EditOrderPage = async () => {
  return <OrderForm />;
};

export default EditOrderPage;
