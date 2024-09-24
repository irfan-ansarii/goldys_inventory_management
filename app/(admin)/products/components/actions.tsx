"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProductType, useDeleteProduct } from "@/query/products";

import { Box, EllipsisVertical, Pencil, Printer } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

import Popup from "@/components/custom-ui/popup";
import DeletePopup from "@/components/delete-popup";
import BarcodePopup from "./barcode-popup";
import Inventories from "./inventories";

const Actions = ({ product }: { product: ProductType }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const router = useRouter();
  const remove = useDeleteProduct(product.id);
  const { data: session } = useAuth();
  const onRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        router.refresh();
        setDeleteOpen(false);
      },
    });
  };

  const barcodes = useMemo(() => {
    const storeInventories =
      product.inventories.find((inv) => inv.storeId === session?.storeId)
        ?.products || [];

    return product.variants.map((variant) => {
      const foundProduct = storeInventories.find(
        (inv: any) => inv.title.toLowerCase() === variant.title.toLowerCase()
      );

      return {
        productId: variant.productId,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        barcode: variant.barcode!,
        image: product.image,
        value: parseFloat(variant.salePrice),
        quantity: foundProduct?.stock || "0",
      };
    });
  }, [session, product.variants, product.inventories]);

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
                      <Inventories data={product.inventories} />
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
            <BarcodePopup defaultValues={barcodes} action="print">
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
