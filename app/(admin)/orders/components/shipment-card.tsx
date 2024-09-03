"use client";
import React from "react";
import { ShipmentType, useEditShipment } from "@/query/orders";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { capitalizeText, getShipmentStatusBadgeClassNames } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Tooltip from "@/components/custom-ui/tooltip";
import ProductItem from "./product-item";
import ShipmentActions from "./shipment-actions";
import ProcessPopup from "./process-pop";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const ShipmentCard = ({
  shipment,
  orderId,
}: {
  shipment: ShipmentType;
  orderId: number;
}) => {
  const showActions = ["rto", "return", "complete"].some((action) =>
    shipment.actions.includes(action)
  );
  const router = useRouter();
  const rtoShipment = useEditShipment({
    orderId,
    shipmentId: shipment.id,
    action: "rto",
  });

  const completeShipment = useEditShipment({
    orderId,
    shipmentId: shipment.id,
    action: "complete",
  });

  return (
    <Card>
      <CardHeader className="border-b flex-row space-y-0 !pb-4 !md:pb-6">
        <div className="space-y-1.5 flex-1">
          <CardTitle className="text-base">
            <Badge
              className={`rounded-md py-1 uppercase ${getShipmentStatusBadgeClassNames(
                shipment.status!
              )}`}
            >
              {shipment.status}
            </Badge>
          </CardTitle>

          <div className="flex text-sm gap-3">
            {(shipment.carrier || shipment.trackingUrl) && (
              <div>
                <p className="text-muted-foreground">{shipment.carrier}</p>
                <Tooltip content="Track order">
                  {shipment.trackingUrl ? (
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      className="text-indigo-600 hover:underline"
                    >
                      {shipment.awb}
                    </a>
                  ) : (
                    <p>{shipment.awb}</p>
                  )}
                </Tooltip>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">
                {capitalizeText(shipment.status!)} on
              </p>
              <p>{format(shipment.updatedAt!, "PPP")}</p>
            </div>
          </div>
        </div>
        <ShipmentActions shipment={shipment} />
      </CardHeader>

      <CardContent className="divide-y">
        {shipment.lineItems.map((item, i) => (
          <ProductItem
            key={i}
            item={{ ...item, currentQuantity: item.quantity }}
          />
        ))}
      </CardContent>

      {showActions ? (
        <div className="justify-end p-4 md:p-6 border-t flex gap-4">
          {/* return action */}
          {shipment.actions?.includes("return") && (
            <ProcessPopup
              items={shipment.lineItems.map((item) => ({
                lineItemId: item.lineItemId!,
                productId: item.productId!,
                variantId: item.variantId!,
                price: item.price!,
                quantity: item.quantity!,
                max: item.quantity!,
                title: item.title!,
                variantTitle: item.variantTitle!,
                image: item.image || "",
              }))}
              orderId={orderId}
              shipmentId={shipment.id}
            >
              <Button variant="destructive">Initiate Return</Button>
            </ProcessPopup>
          )}

          {/* rto action */}
          {shipment.actions?.includes("rto") && (
            <Button
              variant="destructive"
              className="w-32"
              onClick={() =>
                rtoShipment.mutate({}, { onSuccess: () => router.refresh() })
              }
              disabled={rtoShipment.isPending}
            >
              {rtoShipment.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Mark as RTO"
              )}
            </Button>
          )}

          {/* complete action */}
          {shipment.actions?.includes("complete") && (
            <Button
              onClick={() =>
                completeShipment.mutate(
                  {},
                  { onSuccess: () => router.refresh() }
                )
              }
              disabled={completeShipment.isPending}
              className="w-40"
            >
              {completeShipment.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : shipment.kind === "rto" ? (
                "Acknowledge RTO"
              ) : shipment.kind === "return" ? (
                "Acknowledge Return"
              ) : (
                "Mark as Delivered"
              )}
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
};

export default ShipmentCard;
