"use client";

import React, { useState } from "react";
import { ExpenseType, useDeleteExpense } from "@/query/expenses";
import { EllipsisVertical, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import Popup from "@/components/custom-ui/popup";

import ExpensePopup from "./expense-popup";

import { useRouter } from "next/navigation";
import DeletePopup from "@/components/delete-popup";

const Actions = ({ expense }: { expense: ExpenseType }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const remove = useDeleteExpense(expense.id);

  const onRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        router.refresh();
      },
    });
  };

  return (
    <Popup
      variant="popover"
      content={
        <div className="flex flex-col md:w-40 [&>*]:justify-start">
          <ExpensePopup
            defaultValue={{
              id: expense.id,
              title: expense.title,
              category: expense.category,
              amount: expense.amount,
              notes: expense.notes!,
              createdAt: expense.createdAt!,
            }}
          >
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </ExpensePopup>

          <DeletePopup
            open={open}
            onOpenChange={setOpen}
            loading={remove.isPending}
            onDelete={onRemove}
          />
        </div>
      }
    >
      <Button className="px-2" variant="ghost">
        <EllipsisVertical className="w-5 h-5" />
      </Button>
    </Popup>
  );
};

export default Actions;
