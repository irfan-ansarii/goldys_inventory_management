import React from "react";
import Link from "next/link";
import { ChevronRight, Download, Eye, Plus } from "lucide-react";

import Lottie from "react-lottie";
import * as animationData from "@/public/animation.json";
import * as animationDat from "@/public/animation-confetti.json";

import { Button, buttonVariants } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

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

  const defaultOption = {
    loop: true,
    autoplay: true,
    animationData: animationDat,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleClick = (action: string) => {
    console.log("action is: ", action);
  };

  return (
    <div className="relative">
      <Lottie options={defaultOptions} height={160} width={160} />
      <div className="absolute w-full [&>*]:w-full [&>*]:h-full -top-20">
        <Lottie options={defaultOption} />
      </div>
      <div className="h-full overflow-y-auto relative z-10">
        <div className="text-center space-y-1">
          <DialogTitle className="text-xl">Purchase Order Created!</DialogTitle>
          <p>
            Congratulations a new purchase order has been <br />
            successfully created!
          </p>
        </div>

        <div className="space-y-2 mt-10">
          <Button
            className="h-auto w-full px-2"
            variant="outline"
            onClick={() => handleClick("download")}
          >
            <div className="flex gap-3 overflow-hidden">
              <span className="w-10 h-10 inline-flex items-center justify-center bg-secondary rounded-full flex-none">
                <Download className="w-4 h-4" />
              </span>
              <div className="text-left truncate">
                <p className="font-medium">Download Invoice</p>
                <DialogDescription className="truncate">
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
            href={`/purchases/${order.id}`}
          >
            <div className="flex gap-3 overflow-hidden">
              <span className="w-10 h-10 inline-flex items-center justify-center bg-secondary rounded-full flex-none">
                <Eye className="w-4 h-4" />
              </span>
              <div className="text-left truncate">
                <p className="font-medium">View Purchase</p>
                <DialogDescription className="truncate">
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
                <p className="font-medium">New purchase</p>
                <DialogDescription className="truncate">
                  Create a new purchase order
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
