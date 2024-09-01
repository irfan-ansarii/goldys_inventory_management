import React from "react";
import Link from "next/link";
import { ChevronRight, Download, Eye, Mail, Plus, Printer } from "lucide-react";

import { toast } from "sonner";
import Lottie from "react-lottie";
import * as animationData from "@/public/animation.json";

import { Button, buttonVariants } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useInvoiceAction } from "@/query/orders";

interface Props {
  order: any;
  onNext: () => void;
}

const InvoiceTab = ({ order, onNext }: Props) => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const invoice = useInvoiceAction(String(order.id));

  const handleClick = (action: string) => {
    if (invoice.isPending) return;
    const id = toast.loading("Please wait...");
    invoice.mutate(action, {
      onSuccess: ({ data }) => {
        if (action === "pdf") {
          toast.dismiss(id);
          window.open(data.url, "_blank");
        } else {
          toast.success(`Invoice sent to customer`, { id });
        }
      },
    });
  };

  return (
    <div className="relative">
      <span className="-mt-10">
        <Lottie options={defaultOptions} height={160} width={160} />
      </span>
      <div className="h-full overflow-y-auto relative z-10 -mt-10">
        <div className="text-center space-y-1">
          <DialogTitle className="text-xl">Order Created!</DialogTitle>
          <p>
            Congratulations a new order has been <br />
            successfully created!
          </p>
        </div>

        <div className="space-y-2 mt-10">
          <Button
            className="h-auto w-full px-2"
            variant="outline"
            onClick={() => handleClick("send")}
          >
            <div className="flex gap-3 overflow-hidden">
              <span className="w-10 h-10 inline-flex items-center justify-center bg-secondary rounded-full flex-none">
                <Mail className="w-4 h-4" />
              </span>
              <div className="text-left truncate">
                <p className="font-medium">Email Invoice</p>
                <DialogDescription className="truncate font-normal">
                  Send a digital copy of the invoice to customer
                </DialogDescription>
              </div>
            </div>
            <span className="ml-auto">
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
          <Button
            className="h-auto w-full px-2"
            variant="outline"
            onClick={() => handleClick("print")}
          >
            <div className="flex gap-3 overflow-hidden">
              <span className="w-10 h-10 inline-flex items-center justify-center bg-secondary rounded-full flex-none">
                <Printer className="w-4 h-4" />
              </span>
              <div className="text-left truncate">
                <p className="font-medium">Print Invoice</p>
                <DialogDescription className="truncate font-normal">
                  Get a physical copy of the invoice
                </DialogDescription>
              </div>
            </div>
            <span className="ml-auto">
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
          <Button
            className="h-auto w-full px-2"
            variant="outline"
            onClick={() => handleClick("pdf")}
          >
            <div className="flex gap-3 overflow-hidden">
              <span className="w-10 h-10 inline-flex items-center justify-center bg-secondary rounded-full flex-none">
                <Download className="w-4 h-4" />
              </span>
              <div className="text-left truncate">
                <p className="font-medium">Download Invoice</p>
                <DialogDescription className="truncate font-normal">
                  Get a digital copy of the invoice
                </DialogDescription>
              </div>
            </div>
            <span className="ml-auto">
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
          <Link
            className={buttonVariants({
              variant: "outline",
              className: "!h-auto w-full !px-2",
            })}
            href={`/orders/${order.id}`}
          >
            <div className="flex gap-3 overflow-hidden">
              <span className="w-10 h-10 inline-flex items-center justify-center bg-secondary rounded-full flex-none">
                <Eye className="w-4 h-4" />
              </span>
              <div className="text-left truncate">
                <p className="font-medium">View Order</p>
                <DialogDescription className="truncate font-normal">
                  View created order
                </DialogDescription>
              </div>
            </div>
            <span className="ml-auto">
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
          <Button
            className="h-auto w-full px-2"
            variant="outline"
            onClick={onNext}
          >
            <div className="flex gap-3 overflow-hidden">
              <span className="w-10 h-10 inline-flex items-center justify-center bg-secondary rounded-full flex-none">
                <Plus className="w-4 h-4" />
              </span>
              <div className="text-left truncate">
                <p className="font-medium">Add Order</p>
                <DialogDescription className="truncate font-normal">
                  Create a new order
                </DialogDescription>
              </div>
            </div>
            <span className="ml-auto">
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTab;
