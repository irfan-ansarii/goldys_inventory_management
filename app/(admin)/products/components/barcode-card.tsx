import React from "react";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import { BarcodeType } from "@/query/barcodes";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import Tooltip from "@/components/custom-ui/tooltip";
import Avatar from "@/components/custom-ui/avatar";
import { Button } from "@/components/ui/button";
import BarcodeActions from "./barcode-actions";

const BarcodeCard = ({ data }: { data: BarcodeType }) => {
  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent className="p-4 md:p-6 space-y-1.5">
        <div className="flex gap-4 items-center">
          <Avatar src={data.image} />

          <div className="space-y-1">
            <h2 className="font-medium capitalize"> {data.title}</h2>
            <Badge variant="outline">{data.variantTitle}</Badge>
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <Badge
              className="py-1 capitalize"
              variant={data.status === "Printed" ? "secondary" : "default"}
            >
              <span className="mr-1">{data.quantity} </span>
              {data.status}
            </Badge>

            <BarcodeActions data={data} />
          </div>
        </div>
        <div className="flex gap-2 items-center text-muted-foreground text-xs">
          <span className="w-10 mr-2"></span>
          <Tooltip content="Created at">
            <span className="inline-flex gap-1 items-center">
              <Calendar className="w-3.5 h-3.5" />
              {format(data.createdAt!, "MMM dd, yy")}
            </span>
          </Tooltip>

          {data.createdBy && (
            <>
              <p>▪</p>
              <Tooltip content="Created by">
                <span className="inline-flex gap-1 items-center">
                  <User className="w-3.5 h-3.5" />
                  {data.createdBy.name}
                </span>
              </Tooltip>
            </>
          )}
          {data.updatedBy && (
            <>
              <p>▪</p>
              <Tooltip content="Updated by">
                <span className="inline-flex gap-1 items-center">
                  <User className="w-3.5 h-3.5" />
                  {data.updatedBy.name}
                </span>
              </Tooltip>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeCard;
