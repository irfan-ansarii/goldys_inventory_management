import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getPurchase, getPurchaseTransactions } from "@/query/purchase";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { formatDate, formatNumber, getOrderBadgeClassNames } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import ProductItem from "../components/product-item";

import CopyText from "@/components/copy-text";
import Actions from "../components/actions";

const OrderPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { data: purchase } = await getPurchase(id);
  const { data: transactions } = await getPurchaseTransactions(id);
  const { lineItems } = purchase;
  const className = getOrderBadgeClassNames(purchase.paymentStatus!);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        {/* header */}
        <div className="flex gap-4 items-center">
          <Link
            href="/orders"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <CardTitle className="text-base leading-tight">
              {purchase.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {formatDate(purchase.createdAt!)}
            </CardDescription>
          </div>
          <Actions purchase={purchase} type="single" />
        </div>

        {/* products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {lineItems.map((item, i) => (
              <ProductItem key={i} item={item} />
            ))}
          </CardContent>
        </Card>

        {/* order totals */}
        <Card>
          <CardContent className="px-6 py-4 [&>*]:py-1 [&>div]:flex [&>div]:justify-between">
            <div>
              <span>Subtotal</span>
              <span>{formatNumber(purchase.subtotal)}</span>
            </div>
            <div>
              <span>Discount</span>
              <span>{formatNumber(purchase.discount)}</span>
            </div>
            <div>
              <span>Tax</span>
              <span>{formatNumber(purchase.tax)}</span>
            </div>
            <div className="text-lg font-semibold">
              <span>Total</span>
              <span>{formatNumber(purchase.total)}</span>
            </div>

            <Badge
              className={`rounded-md !p-2 text-sm justify-between capitalize ${className}`}
            >
              <span>
                {parseFloat(purchase.due) > 0
                  ? "Due"
                  : parseFloat(purchase.due) < 0
                  ? "Overpaid"
                  : "Paid"}
              </span>
              <span>
                {parseFloat(purchase.due) !== 0 &&
                  formatNumber(Math.abs(parseFloat(purchase.due)))}
              </span>
            </Badge>

            {/* transactions */}
            {transactions.length > 0 && (
              <Collapsible className="!block">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="link"
                    className="w-full px-0 [&[data-state=open]>svg]:rotate-90 hover:no-underline"
                  >
                    View Transactions
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="divide-y">
                  {transactions.map((txn) => (
                    <div
                      className="py-2 first:pt-0 last:pb-0 text-sm flex justify-between items-center"
                      key={txn.id}
                    >
                      <span>
                        <p>{txn.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(txn.createdAt!, "PP")}
                        </p>
                      </span>
                      {txn.kind === "paid" && (
                        <span className="text-green-600">
                          +{formatNumber(txn.amount!)}
                        </span>
                      )}
                      {txn.kind === "refund" && (
                        <span className="text-destructive">
                          -{formatNumber(txn.amount!)}
                        </span>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Notes and tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* empty notes */}
            {!purchase.notes && (!purchase.tags || !purchase.tags.length) && (
              <span className="text-muted-foreground">No notes</span>
            )}

            <div className="whitespace-pre-line">{purchase.notes}</div>
            {purchase.tags && purchase.tags.length > 0 && (
              <div className="space-x-2 mt-4">
                {purchase.tags?.map((tag, i) => (
                  <Badge
                    variant="outline"
                    key={`${tag}-${i}`}
                    className="py-1 rounded-md"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplier details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CopyText textToCopy={purchase.supplier?.name} />
            <CopyText
              as="a"
              textToCopy={purchase.supplier?.phone}
              className="text-indigo-600 hover:underline"
              href={`tel:${purchase.supplier?.phone}`}
            />
            <CopyText
              as="a"
              textToCopy={purchase.supplier?.email}
              className="text-indigo-600 hover:underline"
              href={`mailto:${purchase.supplier?.email}`}
            />
            <p className="font-semibold !mt-4">Address</p>
            <CopyText
              textToCopy={purchase.supplier.source?.join("\r\n")}
              className="text-muted-foreground"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderPage;
