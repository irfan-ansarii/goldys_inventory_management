import React from "react";
import { Pencil, ShoppingBag } from "lucide-react";
import { capitalizeText, cn, formatNumber } from "@/lib/utils";
import { useFormContext, useWatch } from "react-hook-form";
import { OrderFormValues } from "./form";

import { CardContent } from "@/components/ui/card";

import CheckoutPopup from "./checkout-popup";
import CartItem from "./cart-item";

import Popup from "@/components/custom-ui/popup";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const OrderCart = ({
  className,
  calculateCart,
}: {
  className?: string;
  calculateCart: () => void;
}) => {
  const { setValue, register, control } = useFormContext<OrderFormValues>();

  const [cartLineItems, subtotal, discount, taxType, tax, charges, total] =
    useWatch({
      control,
      name: [
        "lineItems",
        "subtotal",
        "discount",
        "taxKind.type",
        "tax",
        "charges.amount",
        "total",
      ],
      exact: true,
    });

  const isEmpty = cartLineItems.length === 0;

  const handlePlus = (index: number) => {
    const { currentQuantity } = cartLineItems[index];
    setValue(`lineItems.${index}.currentQuantity`, currentQuantity! + 1);
    calculateCart();
  };

  const handleMinus = (index: number) => {
    const { currentQuantity, quantity, requiresShipping, shippingQuantity } =
      cartLineItems[index];

    // TODO fix quantity issues
    let fulfilled = 0;
    if (requiresShipping) {
      fulfilled = (quantity || 0) - (shippingQuantity || 0);
    }

    if (currentQuantity === fulfilled) {
      toast.info("Fulfilled item(s) could not be removed.");
      return;
    }

    if (quantity && currentQuantity === 1) {
      setValue(`lineItems.${index}.currentQuantity`, 0);
    } else if (currentQuantity === 1) {
      cartLineItems.splice(index, 1);
      setValue("lineItems", cartLineItems);
    } else if (currentQuantity! > 1) {
      setValue(`lineItems.${index}.currentQuantity`, currentQuantity! - 1);
    }
    calculateCart();
  };

  return (
    <CardContent className={cn(`p-6 flex flex-col gap-2 h-full`, className)}>
      {/* empty cart */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col gap-2 items-center justify-center">
          <ShoppingBag className="w-20 h-20 text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-y-scroll divide-y dark:divide-accent overflow-x-hidden">
          {cartLineItems.map((field, i) => (
            <CartItem
              key={`${field.variantId}-${i}`}
              field={field}
              index={i}
              handlePlus={() => handlePlus(i)}
              handleMinus={() => handleMinus(i)}
            />
          ))}
        </div>
      )}
      <hr />
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatNumber(subtotal || 0)}</span>
        </div>
        <div className="flex justify-between">
          <Popup
            variant="popover"
            content={
              <div className="p-2 space-y-2 md:w-56">
                <Label>Discount Type</Label>
                <RadioGroup
                  defaultValue="fixed"
                  {...(register("discountLines.type"),
                  {
                    onValueChange: (e) => setValue("discountLines.type", e),
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

                {/* <Label className="!mt-3 block">Apply on</Label>
                <RadioGroup
                  defaultValue="fixed"
                  {...(register("discountLines.kind"),
                  {
                    onValueChange: (e) => setValue("discountLines.kind", e),
                  })}
                >
                  <Label className="relative flex-1 pl-6">
                    <RadioGroupItem value="fixed" className="absolute left-0" />
                    Cart Items
                  </Label>
                  <Label className="relative flex-1 pl-6">
                    <RadioGroupItem value="cart" className="absolute left-0" />
                    Order Amount
                  </Label>
                </RadioGroup> */}
                <div className="space-y-1.5">
                  <Label>Reason/Coupon</Label>
                  <Input {...register("discountLines.reason")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input {...register("discountLines.amount")} />
                </div>
              </div>
            }
          >
            <span className="inline-flex items-center gap-2 cursor-pointer select-none">
              Discount <Pencil className="w-3.5 h-3.5" />
            </span>
          </Popup>
          <span>{formatNumber(discount || 0)}</span>
        </div>
        <div className="flex justify-between">
          <Popup
            variant="popover"
            content={
              <div className="p-2 space-y-2 md:w-56">
                <div className="font-medium">Tax</div>
                <RadioGroup
                  defaultValue="included"
                  {...(register("taxKind.type"),
                  {
                    onValueChange: (e) => setValue("taxKind.type", e),
                  })}
                >
                  <Label className="relative border rounded-md p-3 flex-1">
                    <RadioGroupItem
                      value="included"
                      className="absolute right-3"
                    />
                    Included
                  </Label>

                  <Label className="relative border rounded-md p-3 flex-1">
                    <RadioGroupItem
                      value="excluded"
                      className="absolute right-3"
                    />
                    Excluded
                  </Label>
                </RadioGroup>
                <Label className="block !mt-3">Sale Type</Label>
                <RadioGroup
                  defaultValue="state"
                  {...(register("taxKind.saleType"),
                  { onValueChange: (e) => setValue("taxKind.saleType", e) })}
                >
                  <Label className="relative border rounded-md p-3 flex-1">
                    <RadioGroupItem
                      value="state"
                      className="absolute right-3"
                    />
                    State
                  </Label>

                  <Label className="relative border rounded-md p-3 flex-1">
                    <RadioGroupItem
                      value="inter state"
                      className="absolute right-3"
                    />
                    Inter State
                  </Label>
                </RadioGroup>
              </div>
            }
          >
            <span className="inline-flex items-center gap-2 cursor-pointer select-none">
              Tax{" "}
              <span className="text-muted-foreground">
                ({capitalizeText(taxType || "included")})
              </span>
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </Popup>
          <span>{formatNumber(tax || 0)}</span>
        </div>
        <div className="flex justify-between">
          <Popup
            variant="popover"
            content={
              <div className="p-2 space-y-2 md:w-56">
                <div className="font-medium">Additional Charges</div>

                <div className="space-y-1.5">
                  <Label>Reason</Label>
                  <Input {...register(`charges.reason`)} defaultValue="" />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input {...register(`charges.amount`)} defaultValue="" />
                </div>
              </div>
            }
          >
            <span className="inline-flex items-center gap-2 cursor-pointer select-none">
              Additional Charges <Pencil className="w-3.5 h-3.5" />
            </span>
          </Popup>

          <span>{formatNumber(charges || 0)}</span>
        </div>
        <div className="font-medium text-lg flex justify-between">
          <span>Total</span>
          <span>{formatNumber(total || 0)}</span>
        </div>

        <CheckoutPopup disabled={!cartLineItems?.length} />
      </div>
    </CardContent>
  );
};

export default OrderCart;
