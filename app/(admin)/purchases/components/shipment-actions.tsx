"use client";
import React from "react";

import { Download, EllipsisVertical, Pencil, Truck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Popup from "@/components/custom-ui/popup";
import { OrderType } from "@/query/orders";

const ShipmentActions = ({ order }: { order: OrderType }) => {
  return (
    <Popup
      variant="popover"
      content={
        <div className="flex flex-col md:w-44 [&>*]:justify-start">
          <Button variant="ghost" size="sm">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Label
          </Button>
          <Button variant="ghost" size="sm">
            <Truck className="w-4 h-4 mr-2" />
            Track
          </Button>

          <Button variant="danger" size="sm">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      }
    >
      <Button size="icon" variant="secondary">
        <EllipsisVertical className="w-5 h-5" />
      </Button>
    </Popup>
  );
};

export default ShipmentActions;
