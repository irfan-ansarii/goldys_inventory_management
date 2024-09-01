import React from "react";
import InvoiceForm from "./invoice-form";
import { CardTitle } from "@/components/ui/card";
import { getOption } from "@/query/options";

const InvoicePage = async () => {
  const { data } = await getOption("invoice");

  return (
    <div className="space-y-6">
      <CardTitle className="text-lg">Invoice Setting</CardTitle>
      <InvoiceForm defaultValues={data} />
    </div>
  );
};

export default InvoicePage;
