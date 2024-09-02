import React from "react";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import { AdjustmentType } from "@/query/adjustments";
import { capitalizeText } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import Tooltip from "@/components/custom-ui/tooltip";
import Avatar from "@/components/custom-ui/avatar";

const AdjustmentCard = ({ data }: { data: AdjustmentType }) => {
  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent className="p-4 grid grid-cols-3 gap-4">
        <div className="col-span-2 flex gap-4">
          <Avatar src={data.image || data.title!} />
          <div className="space-y-1 flex-1">
            <h2 className="font-medium capitalize"> {data.title}</h2>
            <div className="flex gap-2 truncate">
              <Badge variant="secondary" className="py-0">
                {data.variantTitle}
              </Badge>
              <Badge className="py-0" variant="secondary">
                {capitalizeText(data.reason!)}
              </Badge>
            </div>
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
          </div>
        </div>
        <div className="ml-auto flex gap-2 items-center">
          <Badge
            className="py-0.5"
            variant={data?.quantity! > 0 ? "success" : "destructive"}
          >
            {data?.quantity! > 0 ? "+" : "-"}
            {Math.abs(data?.quantity || 0)} Pieces
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdjustmentCard;
