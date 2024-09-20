import React from "react";
import { Minus, Pencil, Plus } from "lucide-react";
import { OrderFormValues } from "./form";
import { formatNumber } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Avatar from "@/components/custom-ui/avatar";
import Popup from "@/components/custom-ui/popup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "react-hook-form";

const CartItem = ({
  index,
  field,
  handlePlus,
  handleMinus,
  calculateCart,
}: {
  index: number;
  field: OrderFormValues["lineItems"][0];
  handlePlus: () => void;
  handleMinus: () => void;
  calculateCart: () => void;
}) => {
  const { setValue, register } = useFormContext<OrderFormValues>();

  return (
    <div className="py-2 group first:pt-0 last:pb-0 group relative">
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
              parseFloat(field.total!) < parseFloat(field.subtotal!)
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            {formatNumber(field.subtotal!)}
          </p>

          <p className="font-medium">{formatNumber(field.total!)}</p>
        </div>
        {/* discount popover */}
        <Popup
          variant="popover"
          content={
            <div className="p-2 space-y-2 md:w-56">
              <Label>Discount Type</Label>
              <RadioGroup
                defaultValue="fixed"
                {...(register(`lineItems.${index}.discountLine.type`),
                {
                  onValueChange: (e) => {
                    setValue(`lineItems.${index}.discountLine.type`, e);
                    calculateCart();
                  },
                })}
              >
                <Label className="relative flex-1 pl-6">
                  <RadioGroupItem value="fixed" className="absolute left-0" />
                  Fixed
                </Label>

                <Label className="relative flex-1 pl-6">
                  <RadioGroupItem
                    value="percentage"
                    className="absolute left-0"
                  />
                  Percentage
                </Label>
              </RadioGroup>

              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input
                  {...register(`lineItems.${index}.discountLine.amount`, {
                    onChange: calculateCart,
                  })}
                />
              </div>
            </div>
          }
        >
          <Button
            size="icon"
            className="opacity-0 transition transform group-hover:opacity-100 px-2 -right-0.5 absolute inset-y-0 h-auto w-auto"
            variant="outline"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </Popup>
      </div>
    </div>
  );
};

export default CartItem;
