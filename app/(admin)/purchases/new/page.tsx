import React from "react";
import { Metadata } from "next";
import PurchaseOrderForm from "../components/form";

export const metadata: Metadata = {
  title: "New Purchase",
};

const EditOrderPage = async () => {
  return <PurchaseOrderForm />;
};

export default EditOrderPage;
