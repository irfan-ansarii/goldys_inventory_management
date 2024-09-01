"use client";
import React, { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateOption } from "@/query/options";
import {
  EllipsisVertical,
  GripVertical,
  Loader,
  Pencil,
  PlusCircle,
} from "lucide-react";

import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentPopup from "./payment-popup";
import Popup from "@/components/custom-ui/popup";
import DeletePopup from "@/components/delete-popup";

const schema = z
  .object({
    name: z.string().default(""),
    key: z.string().default(""),
  })
  .array();

type FormValues = z.infer<typeof schema>;

const PaymentForm = ({
  order,
  purchase,
}: {
  order: FormValues;
  purchase: FormValues;
}) => {
  const [open, setOpen] = useState(false);

  const orderOptions = useUpdateOption("order-payments");
  const purchaseOptions = useUpdateOption("purchase-payments");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      order: order,
      purchase: purchase,
    },
  });

  const orderFields = useFieldArray({
    name: "order",
    control: form.control,
  });

  const purchaseFields = useFieldArray({
    name: "purchase",
    control: form.control,
  });

  // handle save
  const onSave = () => {
    const order = form.getValues("order");
    const purchase = form.getValues("purchase");

    orderOptions.mutate(order);
    purchaseOptions.mutate(purchase);
  };

  return (
    <div className="space-y-6">
      <CardTitle className="text-lg">Order</CardTitle>
      <SortableList
        onSortEnd={(oldIndex, newIndex) => orderFields.move(oldIndex, newIndex)}
        lockAxis="y"
        className="divide-y"
      >
        {orderFields.fields.map((field, i) => (
          <SortableItem key={field.id}>
            <div className="grid grid-cols-3 gap-4 py-2 first:pt-0 last:pb-0">
              <div className="flex items-center col-span-2">
                <DragHandle />
                <div>
                  <p className="font-medium">{field.name}</p>
                </div>
              </div>
              <Popup
                variant="popover"
                content={
                  <div className="flex flex-col md:w-44 [&>*]:justify-start">
                    <PaymentPopup
                      values={{ name: field.name, key: field.key }}
                      onSubmit={(v) => orderFields.update(i, { ...v })}
                    >
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </PaymentPopup>

                    <DeletePopup
                      open={open}
                      onOpenChange={setOpen}
                      loading={false}
                      onDelete={() => orderFields.remove(i)}
                    />
                  </div>
                }
              >
                <Button className="px-2 ml-auto" variant="ghost">
                  <EllipsisVertical className="w-5 h-5" />
                </Button>
              </Popup>
            </div>
          </SortableItem>
        ))}
      </SortableList>
      <PaymentPopup onSubmit={(v) => orderFields.append({ ...v })}>
        <Button className="w-full" variant="secondary">
          <PlusCircle className="w-4 h-4 mr-2" /> Add New
        </Button>
      </PaymentPopup>
      {/* purchase payment modes */}

      <CardTitle className="text-lg">Purchase</CardTitle>

      <SortableList
        onSortEnd={(oldIndex, newIndex) =>
          purchaseFields.move(oldIndex, newIndex)
        }
        lockAxis="y"
        className="divide-y"
      >
        {purchaseFields.fields.map((field, i) => (
          <SortableItem key={field.id}>
            <div className="grid grid-cols-3 gap-4 py-2 first:pt-0 last:pb-0">
              <div className="flex items-center col-span-2">
                <DragHandle />
                <div>
                  <p className="font-medium">{field.name}</p>
                </div>
              </div>
              <Popup
                variant="popover"
                content={
                  <div className="flex flex-col md:w-44 [&>*]:justify-start">
                    <PaymentPopup
                      values={{ name: field.name, key: field.key }}
                      onSubmit={(v) => orderFields.update(i, { ...v })}
                    >
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </PaymentPopup>

                    <DeletePopup
                      open={open}
                      onOpenChange={setOpen}
                      loading={false}
                      onDelete={() => purchaseFields.remove(i)}
                    />
                  </div>
                }
              >
                <Button className="px-2 ml-auto" variant="ghost">
                  <EllipsisVertical className="w-5 h-5" />
                </Button>
              </Popup>
            </div>
          </SortableItem>
        ))}
      </SortableList>
      <PaymentPopup onSubmit={(v) => purchaseFields.append({ ...v })}>
        <Button className="w-full" variant="secondary">
          <PlusCircle className="w-4 h-4 mr-2" /> Add New
        </Button>
      </PaymentPopup>
      <Button
        className="w-28 float-right"
        onClick={onSave}
        disabled={orderOptions.isPending || purchaseOptions.isPending}
      >
        {orderOptions.isPending || purchaseOptions.isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
};

const DragHandle: React.FC = () => {
  return (
    <SortableKnob>
      <Button className="px-2" variant="link">
        <GripVertical className="w-4 h-4" />
      </Button>
    </SortableKnob>
  );
};

export default PaymentForm;
