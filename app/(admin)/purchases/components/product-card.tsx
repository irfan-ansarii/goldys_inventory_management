"use client";
import React from "react";
import { ProductVariantType } from "@/query/products";
import { formatNumber } from "@/lib/utils";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderFormValues } from "./form";
import Avatar from "@/components/custom-ui/avatar";

const ProductCard = ({
  isActive,
  variant,

  calculateCart,
}: {
  isActive: boolean;
  variant: ProductVariantType;
  calculateCart: () => void;
}) => {
  const product = variant.product!;

  const form = useFormContext<OrderFormValues>();

  const { append, update } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const cartLineItems = form.watch("lineItems");

  const handleClick = () => {
    const index = cartLineItems.findIndex(
      (item) => item.variantId === variant.id
    );
    const p = cartLineItems[index];

    if (index >= 0) {
      update(index, {
        ...p,
        currentQuantity: p.currentQuantity! + 1,
      });
    } else {
      append({
        variantId: variant.id,
        productId: product.id,
        title: product.title,
        variantTitle: variant.title,
        image: product.image,
        barcode: variant.barcode,
        hsn: variant.hsn,
        price: variant.purchasePrice,
        purchasePrice: variant.purchasePrice,
        currentQuantity: 1,
        taxRate: variant.taxRate,
        subtotal: "",
        discount: "",
        tax: "",
        total: "",
        taxLines: [],
        discountLine: {
          type: "fixed",
          amount: "",
        },
      });
    }
    // play sound
    calculateCart?.();
  };

  return (
    <Card
      className={`transition duration-500 w-full relative cursor-pointer select-none ${
        isActive ? "ring-2 ring-green-400" : "hover:border-foreground"
      }`}
      onClick={handleClick}
    >
      <Badge
        className="absolute w-6 h-6 justify-center -top-1 -left-1 rounded-full p-0"
        variant={parseInt(variant.stock || "0") > 0 ? "default" : "destructive"}
      >
        {variant.stock || 0}
      </Badge>
      <CardContent className="p-4 md:p-6 space-y-1.5">
        <div className="flex gap-4 items-center">
          <Avatar src={product.image} />
          <div className="truncate">
            <h2 className="font-medium truncate">{product.title}</h2>
            <div className="flex gap-2">
              <Badge variant="outline">{variant.title}</Badge>
              <Badge variant="outline">{variant.barcode}</Badge>
            </div>
          </div>
          <Badge className="py-1 ml-auto">
            {formatNumber(variant.purchasePrice)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
