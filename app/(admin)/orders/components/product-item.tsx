import React from "react";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/custom-ui/avatar";
import Tooltip from "@/components/custom-ui/tooltip";

const ProductItem = ({ item }: { item: any }) => {
  const isRemoved = item.currentQuantity === 0;

  return (
    <div className="flex gap-2 py-2 first:pt-0 last:pb-0">
      <Avatar src={item.image || item.title} />
      <div
        className={`grid grid-cols-2 md:grid-cols-5 flex-1 gap-2 ${
          isRemoved ? "text-muted-foreground" : ""
        }`}
      >
        <div className="col-span-2 md:col-span-3 space-y-1.5">
          <p className={`truncate ${isRemoved ? "line-through" : ""}`}>
            {item.title}
          </p>

          <div className="flex gap-2">
            <Badge variant="secondary" className="py-0">
              {item.variantTitle}
            </Badge>
            {item.properties?.map((prop: any) => (
              <Tooltip
                key={prop.name}
                variant="card"
                content={
                  <div className="whitespace-pre-line p-2">{prop.value}</div>
                }
              >
                <Button
                  variant="secondary"
                  className="h-auto py-0 px-2.5 rounded-full capitalize text-xs bg-indigo-600 hover:bg-indigo-600/80 text-white"
                >
                  {prop.name}
                </Button>
              </Tooltip>
            ))}
            <span>{item.shippingQuantity}</span>
          </div>
        </div>
        <div className="space-x-3">
          <span>{formatNumber(item.price)}</span>
          <span>x</span>
          <span>{item.currentQuantity || 0}</span>
          {isRemoved && (
            <Badge variant="destructive" className="py-0 !ml-auto">
              Removed
            </Badge>
          )}
        </div>
        <div className="text-right">
          <p
            className={`text-muted-foreground text-sm line-through ${
              parseFloat(item.subtotal || 0) <= item.total ? "hidden" : ""
            }`}
          >
            {formatNumber(item.subtotal)}
          </p>
          <p className="font-medium">{formatNumber(item.total)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
