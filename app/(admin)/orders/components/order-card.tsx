"use client";
import React from "react";
import Image from "next/image";
import {
  capitalizeText,
  formatDate,
  formatNumber,
  getOrderBadgeClassNames,
  getShipmentStatusBadgeClassNames,
} from "@/lib/utils";

import { OrderType } from "@/query/orders";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Tooltip from "@/components/custom-ui/tooltip";
import Avatar, { AvatarGroup } from "@/components/custom-ui/avatar";
import Actions from "./actions";
import Popup from "@/components/custom-ui/popup";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const OrderCard = ({ order }: { order: OrderType }) => {
  const className = getOrderBadgeClassNames(order.paymentStatus!);
  const shipmentClass = getShipmentStatusBadgeClassNames(order.shipmentStatus!);
  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent>
        <div className="grid grid-cols-5 gap-2 gap-y-4 sm:gap-4 items-center">
          <div className="flex gap-3 items-center col-span-3  md:col-span-1">
            <Tooltip
              content={capitalizeText(order.shipmentStatus || "Completed")}
            >
              <span
                className={`w-10 h-10 rounded-md inline-flex items-center justify-center shrink-0 ${shipmentClass}`}
              >
                <ShoppingBag className="w-4 h-4" />
              </span>
            </Tooltip>
            <div>
              <Link
                href={`/orders/${order.id}`}
                className="leading-normal hover:underline"
              >
                {order.name}
              </Link>
              <p className="truncate text-xs leading-normal text-muted-foreground">
                {formatDate(order.createdAt!)}
              </p>
            </div>
          </div>

          <div className="md:hidden text-right col-span-2">
            <p className="text-sm truncate"> {order.soldTo?.name}</p>
            <p className="text-sm truncate"> {order.soldBy?.name}</p>
          </div>

          <div className="min-w-28 truncate col-span-3 md:col-span-1">
            <Popup
              variant="popover"
              content={
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                >
                  <CarouselContent className="md:w-56">
                    {order.lineItems.map((item, index) => (
                      <CarouselItem
                        key={index}
                        className="rounded-md overflow-hidden"
                      >
                        <div className="rounded-md overflow-hidden bg-secondary">
                          <Image
                            src={item.image!}
                            width={500}
                            height={500}
                            alt=""
                          />
                        </div>
                        <p className="leading-tight text-sm mt-2 text-muted-foreground">
                          {`${item.title}${
                            item.variantTitle?.toLowerCase() !== "default"
                              ? ` - ${item.variantTitle}`
                              : ""
                          }`}
                        </p>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0 md:-left-6" />
                  <CarouselNext className="right-0 md:-right-6" />
                </Carousel>
              }
            >
              <Button variant="link" className="!p-0 !h-auto">
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
              </Button>
            </Popup>
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
            <p className="text-sm truncate">{order.soldTo?.name || ""}</p>
            <p className="text-xs text-muted-foreground hidden md:block">
              Customer
            </p>
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
