import React from "react";

import { formatNumber, getOrderBadgeClassNames, formatDate } from "@/lib/utils";
import { PurchaseType } from "@/query/purchase";

import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import Tooltip from "@/components/custom-ui/tooltip";
import Avatar from "@/components/custom-ui/avatar";
import Actions from "./actions";

const PurchaseCard = ({ purchase }: { purchase: PurchaseType }) => {
  const className = getOrderBadgeClassNames(purchase.paymentStatus!);
  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-5  gap-2 gap-y-4 sm:gap-4 items-center">
          <div className="flex gap-3 items-center col-span-3 md:col-span-1">
            <span className="w-10 h-10 bg-lime-600 text-white rounded-md inline-flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </span>
            <div>
              <h2 className="leading-normal">{purchase.name}</h2>
              <p className="truncate text-xs leading-normal text-muted-foreground">
                {formatDate(purchase.createdAt!)}
              </p>
            </div>
          </div>

          <div className="truncate col-span-2 text-right md:order-3 md:col-span-2 md:text-left">
            <p className="truncate text-sm">{purchase.supplier?.name}</p>
            <p className="text-xs text-muted-foreground truncate">Supplier</p>
          </div>

          <div className="flex -space-x-2 min-w-28 truncate col-span-3 md:col-span-1 md:order-2">
            {purchase.lineItems.map((item) => (
              <Avatar src={item.image || item.title!} key={item.id} />
            ))}
          </div>

          <div className="ml-auto flex sm:gap-2 items-center col-span-2 md:col-span-1 order-4">
            <Tooltip
              content={
                <TooltipContent
                  purchase={{
                    total: purchase.total,
                    due: purchase.due,
                    status: purchase.paymentStatus!,
                  }}
                  badgeClass={className}
                />
              }
              variant="card"
              className="w-48"
            >
              <span>
                <Badge className={className}>
                  {formatNumber(purchase.total)}
                </Badge>
              </span>
            </Tooltip>
            <Actions purchase={purchase} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseCard;

type Purchase = {
  total: string;
  due: string;
  status: string;
};

type TooltipContentProps = {
  purchase: Purchase;
  badgeClass: string;
};

function TooltipContent({ purchase, badgeClass }: TooltipContentProps) {
  const { total, due, status } = purchase;

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
