import React from "react";
import { Minus, Plus } from "lucide-react";
import { OrderFormValues } from "./form";
import { formatNumber } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Avatar from "@/components/custom-ui/avatar";

const CartItem = ({
  field,
  handlePlus,
  handleMinus,
}: {
  field: OrderFormValues["lineItems"][0];
  handlePlus: () => void;
  handleMinus: () => void;
}) => {
  return (
    <div className="py-2 group first:pt-0 last:pb-0 group">
      <div className="flex">
        <div className="flex flex-1 truncate">
          <Avatar src={field.image} />
          <div className="ml-2 truncate w-full">
            <h2 className="font-medium truncate text-sm">{field.title}</h2>
            <div className="flex gap-0.5 items-end relative truncate">
              <Badge variant="outline" className="py-0.5">
                {field.variantTitle}
              </Badge>

              {field.currentQuantity === 0 && (
                <Badge variant="destructive" className="py-0.5 ml-auto">
                  Removed
                </Badge>
              )}

              <div className="w-24 flex items-center relative justify-between ml-auto [&>div]:cursor-pointer select-none">
                <Button
                  disabled={field.currentQuantity == 0}
                  className="p-0 w-6 h-6 justify-center rounded-full"
                  onClick={handleMinus}
                >
                  <Minus className="w-4 h-4" />
                </Button>

                {field.quantity && field.quantity !== field.currentQuantity && (
                  <span className="w-5 text-center line-through text-destructive">
                    {field.quantity}
                  </span>
                )}

                <span className="w-5 text-center">{field.currentQuantity}</span>
                <Button
                  className="p-0 w-6 h-6 justify-center rounded-full"
                  onClick={handlePlus}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right w-20 ml-auto">
          <p
            className={`line-through text-sm text-muted-foreground ${
              field.purchasePrice! < field.price! ? "opacity-100" : "opacity-0"
            }`}
          >
            {formatNumber(field.total!)}
          </p>

          <p className="font-medium">{formatNumber(field.total!)}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
