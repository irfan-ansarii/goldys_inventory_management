"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PurchaseType, useDeletePurchase } from "@/query/purchase";

import {
  Download,
  EllipsisVertical,
  Eye,
  IndianRupee,
  Pencil,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

import Popup from "@/components/custom-ui/popup";
import DeletePopup from "@/components/delete-popup";
import PaymentTab from "./payment-tab";

const Actions = ({
  purchase,
  type,
}: {
  purchase: PurchaseType;
  type?: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const remove = useDeletePurchase(purchase.id);

  const handleRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        router.refresh();
      },
    });
  };

  const handleInvoice = (action: string) => {
    console.log(action);
  };

  return (
    <>
      <Popup
        variant="popover"
        content={
          <div className="flex flex-col md:w-44 [&>*]:justify-start">
            {type !== "single" && (
              <Link
                href={`/purchases/${purchase.id}`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Link>
            )}
            <Link
              href={`/purchases/${purchase.id}/edit`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInvoice("pdf")}
            >
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>

            {parseFloat(purchase.due) !== 0 && (
              <Popup
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                content={
                  <div className="p-2 md:p-6 relative">
                    <div className="[&>*]:flex [&>*]:flex-col [&>*]:gap-3 [&>*]:h-[34rem] focus-visible:ring-0">
                      <PaymentTab
                        purchase={{
                          id: purchase.id,
                          total: purchase.total,
                          due: purchase.due,
                        }}
                        showSkip={false}
                        onNext={() => setPaymentOpen(false)}
                      />
                    </div>
                  </div>
                }
              >
                <Button variant="ghost" size="sm">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  {parseFloat(purchase.due) < 0 ? "Refund" : "Pay"}
                </Button>
              </Popup>
            )}

            <DeletePopup
              open={open}
              onOpenChange={setOpen}
              loading={remove.isPending}
              onDelete={handleRemove}
            />
          </div>
        }
      >
        <Button
          className="px-2"
          variant={type === "single" ? "outline" : "ghost"}
          size={type === "single" ? "icon" : "default"}
        >
          <EllipsisVertical className="w-5 h-5" />
        </Button>
      </Popup>
    </>
  );
};

export default Actions;
