import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getOrder, getTransactions } from "@/query/orders";
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
import ProcessPopup from "../components/process-pop";
import ShipmentCard from "../components/shipment-card";

const OrderPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { data: order } = await getOrder(id);
  const { data: transactions } = await getTransactions(id);
  const { lineItems, processing, shipments } = order;
  const className = getOrderBadgeClassNames(order.paymentStatus!);
  const products = lineItems.filter((line) => !line.requiresShipping);

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
              {order.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {formatDate(order.createdAt!)}
            </CardDescription>
          </div>
          <Actions order={order} type="single" />
        </div>

        {/* order  products */}
        {products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Products</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {products.map((item, i) => (
                <ProductItem key={i} item={item} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* processing items*/}
        {processing.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Processing</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {processing.map((item, i) => (
                <ProductItem key={i} item={item} />
              ))}
            </CardContent>
            <div className="text-right p-4 md:p-6 border-t">
              <ProcessPopup
                items={processing.map((item) => ({
                  lineItemId: item.id!,
                  productId: item.productId!,
                  variantId: item.variantId!,
                  price: item.salePrice!,
                  quantity: item.shippingQuantity!,
                  max: item.shippingQuantity!,
                  title: item.title!,
                  variantTitle: item.variantTitle!,
                  image: item.image || "",
                }))}
                orderId={order.id}
              >
                <Button>Ship Items</Button>
              </ProcessPopup>
            </div>
          </Card>
        )}

        {/* shipments with status */}
        {shipments.map((shipment) => (
          <ShipmentCard
            shipment={shipment}
            orderId={order.id}
            key={shipment.id}
          />
        ))}

        {/* order totals */}
        <Card>
          <CardContent className="px-6 py-4 [&>*]:py-1 [&>div]:flex [&>div]:justify-between">
            <div>
              <span>Subtotal</span>
              <span>{formatNumber(order.subtotal)}</span>
            </div>
            <div>
              <span>Discount</span>
              <span>{formatNumber(order.discount)}</span>
            </div>
            <div>
              <span>Tax</span>
              <span>{formatNumber(order.tax)}</span>
            </div>
            <div className="text-lg font-semibold">
              <span>Total</span>
              <span>{formatNumber(order.total)}</span>
            </div>

            <Badge
              className={`rounded-md !p-2 text-sm justify-between capitalize ${className}`}
            >
              <span>
                {parseFloat(order.due) > 0
                  ? "Due"
                  : parseFloat(order.due) < 0
                  ? "Overpaid"
                  : "Paid"}
              </span>
              <span>
                {parseFloat(order.due) !== 0 &&
                  formatNumber(Math.abs(parseFloat(order.due)))}
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
                      className="py-1 first:pt-0 last:pb-0 text-sm flex justify-between items-center"
                      key={txn.id}
                    >
                      <span>
                        <p>{txn.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(txn.createdAt!, "PP")}
                        </p>
                      </span>
                      {txn.kind === "sale" && (
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
            {!order.notes && (!order.tags || !order.tags.length) && (
              <span className="text-muted-foreground">No notes</span>
            )}

            <div className="whitespace-pre-line">{order.notes}</div>
            {order.tags && order.tags.length > 0 && (
              <div className="space-x-2 mt-4">
                {order.tags?.map((tag) => (
                  <Badge
                    variant="outline"
                    className="py-1 rounded-md"
                    key={tag}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CopyText textToCopy={order.soldTo?.name} />
            <CopyText
              as="a"
              textToCopy={order.soldTo?.phone}
              className="text-indigo-600 hover:underline"
              href={`tel:${order.soldTo?.phone}`}
            />
            <CopyText
              as="a"
              textToCopy={order.soldTo?.email}
              className="text-indigo-600 hover:underline"
              href={`mailto:${order.soldTo?.email}`}
            />
            <p className="font-semibold !mt-4">Billing Address</p>
            <CopyText
              textToCopy={order.billing?.join("\r\n")}
              className="text-muted-foreground"
            />

            <p className="font-semibold !mt-4">Shipping Address</p>
            <CopyText
              textToCopy={order.shipping?.join("\r\n")}
              className="text-muted-foreground"
            />
          </CardContent>
        </Card>

        {/* Employee details */}
        {order.soldBy?.id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CopyText textToCopy={order.soldBy?.name} />
              <CopyText
                as="a"
                textToCopy={order.soldBy?.phone}
                className="underline"
                href={`tel:${order.soldBy?.phone}`}
              />
              <CopyText
                as="a"
                textToCopy={order.soldBy?.email}
                className="underline"
                href={`mailto:${order.soldBy?.email}`}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
