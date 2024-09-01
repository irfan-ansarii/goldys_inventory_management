import React from "react";
import { format } from "date-fns";
import { Calendar, Download, Upload, User } from "lucide-react";
import { TransferType } from "@/query/transfers";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import Tooltip from "@/components/custom-ui/tooltip";
import Avatar, { AvatarGroup } from "@/components/custom-ui/avatar";

const TransferCard = ({ data }: { data: TransferType }) => {
  const { lineItems } = data;
  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent className="p-4 md:p-6 space-y-2">
        <div className="flex gap-4 items-center">
          <div className="flex -space-x-3">
            <AvatarGroup>
              {lineItems.map((item) => (
                <Avatar key={item.id} src={item.image} title={item.title} />
              ))}
            </AvatarGroup>
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <Badge className="py-1">
              {data.type === "in" ? (
                <Download className="w-4 h-4 mr-1" />
              ) : (
                <Upload className="w-4 h-4 mr-1" />
              )}

              <span className="hidden md:inline ml-1">
                {data.type === "in" ? "Received" : "Sent"}
              </span>
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 items-center text-muted-foreground text-xs">
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

export default TransferCard;
