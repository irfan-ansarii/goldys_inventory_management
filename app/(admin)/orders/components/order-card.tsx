"use client";
import React from "react";
import {
  formatDate,
  formatNumber,
  getOrderBadgeClassNames,
  getShipmentStatusBadgeClassNames,
} from "@/lib/utils";

import { OrderType } from "@/query/orders";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import Tooltip from "@/components/custom-ui/tooltip";
import Avatar, { AvatarGroup } from "@/components/custom-ui/avatar";
import Actions from "./actions";

const OrderCard = ({ order }: { order: OrderType }) => {
  const className = getOrderBadgeClassNames(order.paymentStatus!);

  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-5 md:grid-cols-6  gap-2 gap-y-4 sm:gap-4 items-center">
          <div className="flex gap-3 items-center col-span-3  md:col-span-1">
            <span className="w-10 h-10 bg-purple-600 text-white rounded-md inline-flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <div>
              <h2 className="leading-normal">{order.name}</h2>
              <p className="truncate text-xs leading-normal text-muted-foreground">
                {formatDate(order.createdAt!)}
              </p>
            </div>
          </div>

          <div className="md:hidden text-right col-span-2">
            <p className="text-sm"> {order.soldBy?.name}</p>
            <p className="text-sm"> {order.soldTo?.name}</p>
          </div>

          <div className="min-w-28 truncate col-span-3 md:col-span-1">
            <AvatarGroup max={4}>
              {order.lineItems.map((item) => (
                <Avatar
                  key={item?.id}
                  src={item?.image}
                  title={`${item.title}${
                    item.variantTitle?.toLowerCase() !== "default"
                      ? ` - ${item.variantTitle}`
                      : ""
                  }`}
                />
              ))}
            </AvatarGroup>
          </div>

          <div
            className={`hidden md:block ${
              !order.soldBy?.name ? "opacity-0" : ""
            }`}
          >
            <p className="text-sm">{order.soldBy?.name}</p>
            <p className="text-xs text-muted-foreground hidden md:block">
              Sold By
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-sm">{order.soldTo?.name || ""}</p>
            <p className="text-xs text-muted-foreground hidden md:block">
              Sold To
            </p>
          </div>

          <div
            className={`hidden md:block ${
              order.shipmentStatus ? "opacity-100" : "opacity-0"
            }`}
          >
            <Badge
              className={`uppercase ${getShipmentStatusBadgeClassNames(
                order.shipmentStatus!
              )}`}
            >
              {order.shipmentStatus}
            </Badge>
          </div>

          <div className="ml-auto flex sm:gap-2 items-center col-span-2 md:col-span-1">
            <Tooltip
              content={
                <TooltipContent
                  order={{
                    total: order.total,
                    due: order.due,
                    status: order.paymentStatus!,
                  }}
                  badgeClass={className}
                />
              }
              variant="card"
              className="w-48"
            >
              <span>
                <Badge className={className}>{formatNumber(order.total)}</Badge>
              </span>
            </Tooltip>
            <Actions order={order} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;

type Order = {
  total: string;
  due: string;
  status: string;
};

type TooltipContentProps = {
  order: Order;
  badgeClass: string;
};

function TooltipContent({ order, badgeClass }: TooltipContentProps) {
  const { total, due, status } = order;

  return (
    <div className="text-sm text-muted-foreground [&>div]:flex [&>div]:justify-between p-2">
      <div>
        <span>Total:</span>
        <span className="ml-auto">{formatNumber(total)}</span>
      </div>
      <div>
        <span>Paid:</span>
        <span className="ml-auto">
          {formatNumber(Math.abs(parseFloat(total) - parseFloat(due)))}
        </span>
      </div>

      {parseFloat(due) !== 0 && (
        <div>
          <span className="capitalize">
            {parseFloat(due) > 0 ? "Due:" : "Overpaid:"}
          </span>
          <span className="ml-auto">
            {formatNumber(Math.abs(parseFloat(due)))}
          </span>
        </div>
      )}
      <Badge className={`rounded-md mt-2 capitalize ${badgeClass}`}>
        {status}
      </Badge>
    </div>
  );
}
