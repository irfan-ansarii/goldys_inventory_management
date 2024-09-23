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
      <CardContent className="p-4 grid grid-cols-3 gap-4">
        <div className="flex gap-4 items-start col-span-2">
          <Avatar src={data.image} />

          <div className="space-y-1">
            <h2 className="font-medium capitalize"> {data.title}</h2>
            <Badge variant="outline">{data.variantTitle}</Badge>

            {/* 
            <div className="flex gap-2 items-center text-muted-foreground text-xs !mt-2">
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
             */}
          </div>
        </div>
        <div className="ml-auto flex gap-2 items-center">
          <Badge
            className="py-0.5 capitalize"
            variant={data.status === "Printed" ? "secondary" : "default"}
          >
            <span className="mr-1">{data.quantity} </span>
            {data.status}
          </Badge>

          <BarcodeActions data={data} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeCard;
