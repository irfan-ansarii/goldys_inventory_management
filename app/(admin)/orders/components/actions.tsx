"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderType, useDeleteOrder, useInvoiceAction } from "@/query/orders";

import {
  CircleX,
  Copy,
  Download,
  EllipsisVertical,
  Eye,
  IndianRupee,
  Mail,
  Pencil,
  TriangleAlert,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import Popup from "@/components/custom-ui/popup";
import DeletePopup from "@/components/delete-popup";
import PaymentTab from "./payment-tab";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/query/users";

const Actions = ({ order, type }: { order: OrderType; type?: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: session } = useSession();
  const remove = useDeleteOrder(order.id);
  const invoice = useInvoiceAction(String(order.id));

  // handle duplicate order
  const handleDuplicate = () => {
    window.localStorage.setItem("clone_data", JSON.stringify(order.lineItems));
  };

  // handle delete order
  const handleRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        router.refresh();
      },
    });
  };

  // handle cancel order
  const handleCancel = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        router.refresh();
      },
    });
  };

  // handle send invoice and download invoice
  const handleInvoice = (action: string) => {
    if (invoice.isPending) return;
    const id = toast.loading("Generating invoice please wait...");
    invoice.mutate(action, {
      onSuccess: ({ data }) => {
        if (action === "pdf") {
          toast.dismiss(id);
          window.open(data.url, "_blank");
        } else {
          toast.success(`Invoice sent to customer`, { id });
        }
      },
      onError: (error) => toast.error(error.message, { id }),
    });
  };

  return (
    <>
      <Popup
        variant="popover"
        content={
          <div className="flex flex-col md:w-44 [&>*]:justify-start">
            {type !== "single" && (
              <Link
                href={`/orders/${order.id}`}
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
              href={`/orders/${order.id}/edit`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <Link
              href={`/orders/new`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
              onClick={() => handleDuplicate()}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInvoice("send")}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
            <Button
              variant="ghost"
              disabled={invoice.isPending}
              size="sm"
              onClick={() => handleInvoice("pdf")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>

            {parseFloat(order.due) !== 0 && (
              <Popup
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                content={
                  <div className="p-2 md:p-6 relative">
                    <div className="[&>*]:flex [&>*]:flex-col [&>*]:gap-3 [&>*]:h-[34rem] focus-visible:ring-0">
                      <PaymentTab
                        order={{
                          id: order.id,
                          total: order.total,
                          due: order.due,
                        }}
                        onNext={() => setPaymentOpen(false)}
                        showSkip={false}
                      />
                    </div>
                  </div>
                }
              >
                <Button variant="ghost" size="sm">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  {parseFloat(order.due) < 0 ? "Refund" : "Collect"}
                </Button>
              </Popup>
            )}

            {/* cancel order */}
            {!order.cancelledAt && order.shipmentStatus === "processing" && (
              <Popup
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                content={
                  <div className="p-2 md:p-4 flex flex-col items-stretch texnter gap-6">
                    <div className="flex gap-4 flex-col text-base">
                      <div className="flex gap-3 items-center text-destructive">
                        <TriangleAlert className="w-5 h-5" />
                        <p className="font-semibold">Cancel this order?</p>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        This action cannot be undone, please proceed with
                        caution.
                      </p>
                      <div className="space-y-1.5">
                        <Label>Cancellation Reason</Label>
                        <Input />
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 justify-stretch [&>*]:flex-1">
                      <Button
                        variant="outline"
                        className="order-2 md:order-1"
                        onClick={() => setCancelOpen(false)}
                      >
                        Keep Order
                      </Button>
                      <Button
                        variant="destructive"
                        className="order-1 md:order2"
                        onClick={handleCancel}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  </div>
                }
              >
                <Button variant="danger" disabled={invoice.isPending} size="sm">
                  <CircleX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Popup>
            )}

            {session?.data?.role === "admin" && (
              <DeletePopup
                open={open}
                onOpenChange={setOpen}
                loading={remove.isPending}
                onDelete={handleRemove}
              />
            )}
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
