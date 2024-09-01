"use client";
import React, { useState } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { ProductType, useDeleteProduct } from "@/query/products";

import { Box, EllipsisVertical, Home, Pencil, Printer } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

import Popup from "@/components/custom-ui/popup";
import DeletePopup from "@/components/delete-popup";
import { Badge } from "@/components/ui/badge";
import { DialogTitle } from "@/components/ui/dialog";
import BarcodePopup from "./barcode-popup";

const Actions = ({ product }: { product: ProductType }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const router = useRouter();
  const remove = useDeleteProduct(product.id);

  const onRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        router.refresh();
        setDeleteOpen(false);
      },
    });
  };

  return (
    <Popup
      variant="popover"
      content={
        <div>
          <div className="flex flex-col md:w-44 [&>*]:justify-start">
            <Link
              href={`/products/${product.id}`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Link>

            {product?.inventories?.length > 0 && (
              <Popup
                variant="popover"
                content={
                  <div className="p-2 md:w-52">
                    <div className="divide-y overflow-y-scroll max-h-[30rem]">
                      {product?.inventories?.map((inv) => (
                        <div
                          className="grid grid-cols-3 gap-3 py-2 first:pt-0 last:pb-0"
                          key={inv.id}
                        >
                          <div className="col-span-2 space-y-1">
                            <h2 className="text-sm font-medium">
                              {inv.store?.name}
                            </h2>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="py-0">
                                {inv.variantTitle}
                              </Badge>
                              <Badge variant="secondary" className="py-0">
                                {inv.barcode}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge
                              variant={
                                (inv.stock || 0) >= 5
                                  ? "success"
                                  : "destructive"
                              }
                              className="py-0"
                            >
                              {inv.stock}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <Button variant="ghost" size="sm">
                  <Box className="w-4 h-4 mr-2" />
                  View Inventory
                </Button>
              </Popup>
            )}
            <BarcodePopup
              defaultValues={product.variants.map((item) => ({
                productId: item.productId,
                variantId: item.id,
                title: product.title,
                variantTitle: item.title,
                barcode: item.barcode!,
                image: product.image,
                value: parseFloat(item.salePrice),
                quantity: (1).toString(),
              }))}
              action="print"
            >
              <Button variant="ghost" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print Barcode
              </Button>
            </BarcodePopup>
            <DeletePopup
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              onDelete={onRemove}
              loading={remove.isPending}
            />
          </div>
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
