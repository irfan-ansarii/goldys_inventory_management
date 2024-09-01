import React from "react";
import { z } from "zod";
import { getOption } from "@/query/options";
import { CardTitle } from "@/components/ui/card";
import BarcodeForm from "./barcode-form";

const numberField = z
  .string()
  .min(1)
  .refine((val) => !isNaN(parseFloat(val)), { message: "Invalid Number" });

export const barcodeSchema = z.object({
  width: numberField,
  height: numberField,
  columns: numberField,
  gap: numberField,
  top: numberField,
  bottom: numberField,
  left: numberField,
  right: numberField,
});

export type BarcodeFormValues = z.infer<typeof barcodeSchema>;

const Barcode = async () => {
  const { data }: { data: BarcodeFormValues } = await getOption("barcode");

  return (
    <div className="space-y-6">
      <CardTitle className="text-lg">Barcode Label Setting</CardTitle>
      <BarcodeForm defaultValues={data} />
    </div>
  );
};

export default Barcode;
