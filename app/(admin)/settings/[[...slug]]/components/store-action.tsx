"use client";

import React, { useState } from "react";
import z from "zod";
import Popup from "@/components/custom-ui/popup";
import { StoreType, useDeleteStore } from "@/query/stores";
import StoresPopup from "./stores-popup";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Pencil } from "lucide-react";
import DeletePopup from "@/components/delete-popup";
import { useForm } from "react-hook-form";

import { useUpdateOption } from "@/query/options";
import { zodResolver } from "@hookform/resolvers/zod";

interface StoreProps extends Omit<StoreType, "address"> {
  address: Record<string, string>;
}

const StoreAction = ({ store }: { store: StoreProps }) => {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useDeleteStore(store.id);

  const handleRemove = () => {
    mutate(undefined);
  };

  return (
    <Popup
      variant="popover"
      content={
        <div className="flex flex-col md:w-44 [&>*]:justify-start">
          <StoresPopup defaultValues={{ ...store }}>
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </StoresPopup>

          <DeletePopup
            open={open}
            onOpenChange={setOpen}
            loading={isPending}
            onDelete={handleRemove}
          />
        </div>
      }
    >
      <Button className="px-2 ml-auto" variant="ghost">
        <EllipsisVertical className="w-5 h-5" />
      </Button>
    </Popup>
  );
};

export default StoreAction;
