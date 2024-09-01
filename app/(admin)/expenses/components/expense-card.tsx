import React from "react";
import { format } from "date-fns";
import { formatNumber } from "@/lib/utils";
import { ExpenseType } from "@/query/expenses";

import { Calendar, File, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import Tooltip from "@/components/custom-ui/tooltip";
import Actions from "./actions";

const ExpenseCard = ({ expense }: { expense: ExpenseType }) => {
  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent className="p-4 md:p-6 space-y-1.5">
        <div className="flex gap-2 md:gap-4 items-center overflow-hidden">
          <div className="overflow-hidden">
            <h2 className="font-medium truncate">{expense.title}</h2>
            <div className="flex gap-1 items-center">
              <p className="text-muted-foreground text-sm">
                {expense.category}
              </p>
              {expense.notes && (
                <Tooltip
                  variant="card"
                  content={
                    <div className="w-40">
                      <p className="text-sm">{expense.notes}</p>
                    </div>
                  }
                >
                  <File className="w-3.5 h-3.5 text-muted-foreground" />
                </Tooltip>
              )}
            </div>
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <Badge className="uppercase">{formatNumber(expense.amount)}</Badge>
            <Actions expense={expense} />
          </div>
        </div>

        <div className="flex gap-2 items-center text-muted-foreground text-xs">
          <Tooltip content="Created at">
            <span className="inline-flex gap-1 items-center">
              <Calendar className="w-3.5 h-3.5" />
              {format(expense.createdAt!, "MMM dd, yy")}
            </span>
          </Tooltip>

          {expense.createdBy && (
            <>
              <p>▪</p>
              <Tooltip content="Created by">
                <span className="inline-flex gap-1 items-center">
                  <User className="w-3.5 h-3.5" />
                  {expense.createdBy.name}
                </span>
              </Tooltip>
            </>
          )}
          {expense.updatedBy && (
            <>
              <p>▪</p>
              <Tooltip content="Updated by">
                <span className="inline-flex gap-1 items-center">
                  <User className="w-3.5 h-3.5" />
                  {expense.updatedBy.name}
                </span>
              </Tooltip>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;
